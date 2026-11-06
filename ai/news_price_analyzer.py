
from collections import Counter
from datetime import datetime
from news_price_repository import get_stock_prices, get_news_sentiments


CHANGE_THRESHOLD = 3.0
FLAT_THRESHOLD = 0.5


def summarize_news(news_list):
    """뉴스 감성 분포 및 대표 감성 계산"""
    if not news_list:
        return {
            "status": "NO_DATA",
            "total": 0,
            "positive": 0,
            "negative": 0,
            "neutral": 0,
            "dominant_sentiment": None
        }

    counts = Counter(news["label"] for news in news_list)

    positive = counts["positive"]
    negative = counts["negative"]
    neutral = counts["neutral"]

    # 긍정/부정 뉴스가 동률이거나 중립이 최다이면 혼합으로 처리
    if positive == negative or neutral >= max(positive, negative):
        dominant = "mixed"
    elif positive > negative:
        dominant = "positive"
    else:
        dominant = "negative"

    return {
        "status": "OK",
        "total": len(news_list),
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "dominant_sentiment": dominant
    }



def check_agreement(sentiment, change_rate):
    # 감성 판단 불가 또는 주가 데이터 없음
    if sentiment not in ("positive", "negative"):
        return "UNDETERMINED"

    if change_rate is None:
        return "UNDETERMINED"

    change_rate = float(change_rate)

    # ±0.5% 미만의 주가 변동은 방향 판단에서 제외
    if abs(change_rate) < FLAT_THRESHOLD:
        return "UNDETERMINED"

    # 뉴스 감성과 주가 방향이 일치하는 경우
    if sentiment == "positive" and change_rate > 0:
        return "MATCH"

    if sentiment == "negative" and change_rate < 0:
        return "MATCH"

    # 뉴스 감성과 주가 방향이 일치하지 않는 경우
    return "MISMATCH"



def analyze_news_price(stock_code):
    """종목별 주가 급변일 기준 전·당일·후 뉴스 분석"""
    prices = get_stock_prices(stock_code)
    news = get_news_sentiments(stock_code)

    # 발행 날짜별 뉴스 그룹화
    news_by_date = {}

    for article in news:
        published_at = article["published_at"]
        if published_at is None:
            continue

        news_date = published_at.date()
        news_by_date.setdefault(news_date, []).append(article)

    events = []

    for i, price in enumerate(prices):
        change_rate = price["change_rate"]

        if change_rate is None:
            continue

        change_rate = float(change_rate)

        if abs(change_rate) < CHANGE_THRESHOLD:
            continue

        trade_date = price["trade_date"]

        # 직전/다음 거래일 기준
        previous_date = prices[i - 1]["trade_date"] if i > 0 else None
        next_date = (
            prices[i + 1]["trade_date"]
            if i + 1 < len(prices)
            else None
        )

        
        before = (
        summarize_news(news_by_date.get(previous_date, []))
        if previous_date is not None
        else {"status": "OUT_OF_RANGE"}
        )

        during = summarize_news(
        news_by_date.get(trade_date, [])
        )

        after = (
        summarize_news(news_by_date.get(next_date, []))
        if next_date is not None
        else {"status": "OUT_OF_RANGE"}
        )

        events.append({
            "trade_date": str(trade_date),
            "change_rate": change_rate,
            "before": before,
            "during": during,
            "after": after,
            "agreement": check_agreement(
                during["dominant_sentiment"],
                change_rate
            )
        })

    return {
        "stock_code": stock_code,
        "threshold": CHANGE_THRESHOLD,
        "event_count": len(events),
        "events": events
    }


from datetime import time, timedelta


MARKET_OPEN = time(9, 0)
MARKET_CLOSE = time(15, 30)


def analyze_news_timing(stock_code):
    """뉴스 발행 시점에 따라 비교 대상 거래일을 배정"""
    prices = get_stock_prices(stock_code)
    news = get_news_sentiments(stock_code)

    unassigned_news = {
        "missing_published_at": 0,
        "no_target_date": 0,
        "invalid_target_date": 0
    }

    trade_dates = sorted(
        price["trade_date"] for price in prices
    )

    results = {
        trade_date: {
            "trade_date": str(trade_date),
            "before_market": [],
            "during_market": [],
            "previous_after_market": []
        }
        for trade_date in trade_dates
    }

    for article in news:
        published_at = article["published_at"]

        if published_at is None:
            unassigned_news["missing_published_at"] += 1
            continue

        news_date = published_at.date()
        timing = classify_news_timing(published_at)

        session_map = {
            "BEFORE_MARKET": "before_market",
            "DURING_MARKET": "during_market",
            "AFTER_MARKET": "previous_after_market"
        }

        session = session_map[timing]

        if session == "previous_after_market":
            target_date = next(
                (d for d in trade_dates if d > news_date),
                None
            )
        else:
            target_date = next(
                (d for d in trade_dates if d >= news_date),
                None
            )

        if target_date is None:
            unassigned_news["no_target_date"] += 1
            continue

        if not validate_target_date(news_date, target_date):
            unassigned_news["invalid_target_date"] += 1
            continue

        if target_date > news_date and session != "previous_after_market":
            session = "before_market"

        results[target_date][session].append(article)

    summary = []

    for trade_date in trade_dates:
        item = results[trade_date]

        before = summarize_news(item["before_market"])
        during = summarize_news(item["during_market"])
        previous_after = summarize_news(item["previous_after_market"])

        
        # 해당 거래일의 주가 등락률 조회
        price = next(
            (p for p in prices if p["trade_date"] == trade_date),
            None
        )

        change_rate = (
            float(price["change_rate"])
            if price and price["change_rate"] is not None
            else None
        )

        # 전일 장후 + 당일 장전 + 당일 장중 뉴스 통합
        combined_news = (
            item["previous_after_market"]
            + item["before_market"]
            + item["during_market"]
        )

        combined = summarize_news(combined_news)

        agreement = check_agreement(
            combined["dominant_sentiment"],
            change_rate
        )

        summary.append({
            "trade_date": str(trade_date),
            "change_rate": change_rate,
            "before_market": before,
            "during_market": during,
            "previous_after_market": previous_after,
            "combined_sentiment": combined,
            "agreement": agreement
        })


    
    # 뉴스와 주가가 모두 존재하는 거래일 확인
    valid_days = [
        day for day in summary
        if day["combined_sentiment"]["total"] > 0
        and day["change_rate"] is not None
    ]

    if not prices:
        status = "NO_PRICE_DATA"
    elif len(valid_days) == 0:
        status = "INSUFFICIENT_DATA"
    elif len(valid_days) < 5:
        status = "PARTIAL"
    else:
        status = "COMPLETE"

    return {
        "stock_code": stock_code,
        "status": status,
        "valid_days": len(valid_days),
        "total_analyzed_news": len(news),
        "unassigned_news_count": sum(unassigned_news.values()),
        "unassigned_news_reasons": unassigned_news,
        "daily_analysis": summary
    }

def classify_news_timing(published_at):
    """뉴스 발행 시각을 기준으로 거래시간 구분"""

    if published_at is None:
        return "UNKNOWN"

    news_time = published_at.time()

    if news_time < MARKET_OPEN:
        return "BEFORE_MARKET"

    elif news_time <= MARKET_CLOSE:
        return "DURING_MARKET"

    else:
        return "AFTER_MARKET"


def analyze_daily_lag(stock_code):
    """뉴스 감성과 당일·익일 주가 방향 비교"""

    result = analyze_news_timing(stock_code)
    days = result["daily_analysis"]

    lag_results = []

    for i, day in enumerate(days):
        sentiment = day["combined_sentiment"]["dominant_sentiment"]
        news_count = day["combined_sentiment"]["total"]

        # 뉴스가 없는 날짜는 비교 대상에서 제외
        if news_count == 0:
            continue

        today_rate = day["change_rate"]

        # 다음 거래일 데이터가 있는 경우에만 비교
        next_day = days[i + 1] if i + 1 < len(days) else None

        next_rate = (
            next_day["change_rate"]
            if next_day is not None
            else None
        )

        lag_results.append({
            "trade_date": day["trade_date"],
            "news_count": news_count,
            "sentiment": sentiment,
            "today_change_rate": today_rate,
            "today_agreement": check_agreement(
                sentiment, today_rate
            ),
            "next_trade_date": (
                next_day["trade_date"]
                if next_day is not None
                else None
            ),
            "next_change_rate": next_rate,
            "next_agreement": check_agreement(
                sentiment, next_rate
            )
        })

    return {
        "stock_code": stock_code,
        "status": result["status"],
        "lag_analysis": lag_results
    }


def analyze_session_lag(stock_code):
    """시간대별 뉴스 감성과 대상 거래일 주가 방향 비교"""

    result = analyze_news_timing(stock_code)
    session_results = []

    sessions = [
        "previous_after_market",
        "before_market",
        "during_market"
    ]

    for day in result["daily_analysis"]:
        for session in sessions:
            news_summary = day[session]

            if news_summary["total"] == 0:
                continue

            sentiment = news_summary["dominant_sentiment"]
            change_rate = day["change_rate"]

            session_results.append({
                "trade_date": day["trade_date"],
                "session": session,
                "news_count": news_summary["total"],
                "sentiment": sentiment,
                "change_rate": change_rate,
                "agreement": check_agreement(
                    sentiment, change_rate
                )
            })

    return {
        "stock_code": stock_code,
        "status": result["status"],
        "session_analysis": session_results
    }


def calculate_session_agreement(stock_code):
    """뉴스 발표 시간대별 감성·주가 방향 일치율 집계"""

    result = analyze_session_lag(stock_code)

    sessions = [
        "previous_after_market",
        "before_market",
        "during_market"
    ]

    statistics = {}

    for session in sessions:
        items = [
            item for item in result["session_analysis"]
            if item["session"] == session
        ]

        match_count = sum(
            item["agreement"] == "MATCH"
            for item in items
        )

        mismatch_count = sum(
            item["agreement"] == "MISMATCH"
            for item in items
        )

        undetermined_count = sum(
            item["agreement"] == "UNDETERMINED"
            for item in items
        )

        valid_count = match_count + mismatch_count

        agreement_rate = (
            round(match_count / valid_count * 100, 2)
            if valid_count > 0
            else None
        )

        statistics[session] = {
            "total": len(items),
            "match": match_count,
            "mismatch": mismatch_count,
            "undetermined": undetermined_count,
            "valid_count": valid_count,
            "agreement_rate": agreement_rate,
            "reliable": False
        }

    return {
        "stock_code": stock_code,
        "status": result["status"],
        "session_statistics": statistics
    }


def check_price_date_gaps(stock_code):
    """저장된 주가 날짜 사이의 누락 가능 구간 확인"""

    from datetime import timedelta

    prices = get_stock_prices(stock_code)

    trade_dates = sorted({
        price["trade_date"]
        for price in prices
    })

    gaps = []

    for i in range(len(trade_dates) - 1):
        current_date = trade_dates[i]
        next_date = trade_dates[i + 1]

        # 두 날짜 사이에 평일이 있는지 확인
        missing_weekdays = []

        check_date = current_date + timedelta(days=1)

        while check_date < next_date:
            if check_date.weekday() < 5:
                missing_weekdays.append(str(check_date))

            check_date += timedelta(days=1)

        if missing_weekdays:
            gaps.append({
                "previous_date": str(current_date),
                "next_date": str(next_date),
                "missing_weekdays": missing_weekdays
            })

    return {
        "stock_code": stock_code,
        "price_days": len(trade_dates),
        "possible_gaps": gaps,
        "has_possible_gaps": len(gaps) > 0
    }


def validate_target_date(news_date, target_date):
    """뉴스 날짜와 대상 거래일 사이의 평일 누락 가능성 검사"""

    if target_date is None:
        return False

    if target_date < news_date:
        return False

    check_date = news_date

    while check_date < target_date:
        # 뉴스 발표일 이후의 평일만 확인
        check_date += timedelta(days=1)

        if check_date < target_date and check_date.weekday() < 5:
            return False

    return True

if __name__ == "__main__":
    stock_codes = ["005930", "000660", "005380", "035420"]

    for stock_code in stock_codes:
        result = analyze_news_timing(stock_code)

        print(f"\n종목코드: {stock_code}")
        print("분석 상태:", result["status"])
        print("비교 가능 거래일:", result["valid_days"])

        for day in result["daily_analysis"]:
            if day["combined_sentiment"]["total"] > 0:
                print(
                    day["trade_date"],
                    "등락률:", day["change_rate"],
                    "뉴스:", day["combined_sentiment"]["total"],
                    "감성:", day["combined_sentiment"]["dominant_sentiment"],
                    "판정:", day["agreement"]
                )