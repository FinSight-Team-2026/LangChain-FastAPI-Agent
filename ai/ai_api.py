
import logging
import json
import os
from urllib.request import urlopen
from urllib.error import HTTPError, URLError
from zoneinfo import ZoneInfo

from final_conclusion_agent import analyze_final_conclusion
from analysis_repo import get_recent_news_summaries
from datetime import date, datetime
from threading import Lock
from uuid import uuid4

from fastapi import FastAPI, HTTPException, BackgroundTasks

from db_connection import get_db_connection
from pipeline import run_pipeline
from prediction_agent import prepare_prediction_data, predict_stock_direction


app = FastAPI(title="MOOD ON? AI API")
logger = logging.getLogger(__name__)

# 작업 상태를 메모리에 저장
jobs = {}
jobs_lock = Lock()


@app.get("/api/ai/health")
def health_check():
    return {
        "status": "ok",
        "service": "MOOD ON? AI"
    }


def execute_analysis(job_id, stock_code, stock_name):
    # 작업 시작
    with jobs_lock:
        jobs[job_id]["status"] = "running"
        jobs[job_id]["started_at"] = datetime.now().isoformat()

    try:
        # 기존 AI 파이프라인 실행
        run_pipeline(stock_code, stock_name)

        with jobs_lock:
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["completed_at"] = datetime.now().isoformat()

    except Exception as e:
        with jobs_lock:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = str(e)
            jobs[job_id]["completed_at"] = datetime.now().isoformat()


@app.post("/api/ai/analyze/{stock_code}", status_code=202)
def analyze_stock(stock_code: str, background_tasks: BackgroundTasks):
    conn = None
    cursor = None

    try:
        # 등록된 종목 확인
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT stock_code, stock_name
            FROM stocks
            WHERE stock_code = %s
            """,
            (stock_code,)
        )

        stock = cursor.fetchone()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="종목 조회 중 DB 오류가 발생했습니다."
        )

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

    if stock is None:
        raise HTTPException(
            status_code=404,
            detail="등록되지 않은 종목입니다."
        )

    # 동일 종목의 분석 작업 중복 방지
    with jobs_lock:
        for job in jobs.values():
            if (
                job["stock_code"] == stock_code
                and job["status"] in ("pending", "running")
            ):
                raise HTTPException(
                    status_code=409,
                    detail="해당 종목은 이미 분석 중입니다."
                )

        job_id = str(uuid4())

        jobs[job_id] = {
            "job_id": job_id,
            "stock_code": stock_code,
            "stock_name": stock["stock_name"],
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "started_at": None,
            "completed_at": None,
            "error": None
        }

    # 백그라운드 작업 등록
    background_tasks.add_task(
        execute_analysis,
        job_id,
        stock_code,
        stock["stock_name"]
    )

    return {
        "job_id": job_id,
        "stock_code": stock_code,
        "status": "pending",
        "message": "AI 분석 요청이 접수되었습니다."
    }


@app.get("/api/ai/jobs/{job_id}")
def get_job_status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)

        if job is None:
            raise HTTPException(
                status_code=404,
                detail="존재하지 않는 작업입니다."
            )

        return job.copy()


@app.get("/api/ai/prediction/{stock_code}")
def get_stock_prediction(stock_code: str, as_of_date: date):
    try:
        analysis_data = prepare_prediction_data(stock_code, as_of_date)
        return predict_stock_direction(stock_code, as_of_date, analysis_data)
    except Exception as e:
        logger.exception("주가 방향 예측 처리 실패 (stock_code=%s, as_of_date=%s)", stock_code, as_of_date)
        raise HTTPException(
            status_code=500,
            detail="주가 방향 예측 처리 중 오류가 발생했습니다."
        ) from e

    
@app.get("/api/ai/news-summary/{stock_code}")
def get_news_summary(stock_code: str, limit: int = 5):
    if not 1 <= limit <= 20:
        raise HTTPException(
            status_code=400,
            detail="limit은 1~20 사이여야 합니다."
        )

    try:
        articles = get_recent_news_summaries(stock_code, limit)

        news = []

        for article in articles:
            sentiment = article["sentiment"]

            sentiment_labels = {
                "positive": "호재",
                "neutral": "이슈",
                "negative": "리스크"
            }

            news.append({
                "id": str(article["article_id"]),
                "title": article["title"],
                "url": article["url"],
                "source": "",
                "publishedAt": (
                    article["published_at"].isoformat()
                    if isinstance(article["published_at"], (datetime, date))
                    else str(article["published_at"])
                    if article["published_at"] is not None
                    else None
                ),
                "sentiment": sentiment,
                "sentimentLabel": sentiment_labels.get(
                    sentiment, "이슈"
                ),
                "summary": article["summary"] or "",
                "score": float(article["score"])
            })

        return {
            "stockCode": stock_code,
            "count": len(news),
            "news": news
        }

    except Exception:
        logger.exception(
            "뉴스 요약 조회 실패 (stock_code=%s)", stock_code
        )
        raise HTTPException(
            status_code=500,
            detail="뉴스 요약 조회 중 오류가 발생했습니다."
        )


@app.get("/api/ai/final-conclusion/{stock_code}")
def get_final_conclusion(stock_code: str):

    # 1. DB에서 종목명 확인
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT stock_code, stock_name
            FROM stocks
            WHERE stock_code = %s
            """,
            (stock_code,)
        )

        stock = cursor.fetchone()

    except Exception as e:
        logger.exception("최종 결론 종목 조회 실패")
        raise HTTPException(
            status_code=500,
            detail="종목 조회 중 DB 오류가 발생했습니다."
        ) from e

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

    if stock is None:
        raise HTTPException(
            status_code=404,
            detail="등록되지 않은 종목입니다."
        )

    # 2. MySQL에서 실제 뉴스 감성 분석 결과 조회
    try:
        articles = get_recent_news_summaries(
            stock_code, 10
        )

        news_data = []

        for article in articles:
            published_at = article.get("published_at")

            if isinstance(published_at, (datetime, date)):
                published_at = published_at.isoformat()

            news_data.append({
                "title": article["title"],
                "sentiment": article["sentiment"],
                "summary": article["summary"] or "",
                "publishedAt": published_at
            })

    except Exception as e:
        logger.exception("최종 결론 뉴스 조회 실패")
        raise HTTPException(
            status_code=500,
            detail="뉴스 감성 데이터 조회 실패"
        ) from e

    # 3. Spring Boot 시장 비교 API 호출
    spring_url = os.getenv(
        "SPRING_BOOT_URL",
        "http://127.0.0.1:8080"
    ).rstrip("/")

    market_url = (
        f"{spring_url}/api/market/compare/{stock_code}"
    )

    try:
        with urlopen(market_url, timeout=15) as response:
            market_data = json.load(response)

        if not isinstance(market_data, dict):
            raise ValueError("시장 비교 응답 형식 오류")

        required = (
            "stockCode",
            "startDate",
            "endDate",
            "stockReturn",
            "kospiReturn",
            "relativeReturn"
        )

        if any(key not in market_data for key in required):
            raise ValueError("시장 비교 데이터 누락")

    except (HTTPError, URLError, TimeoutError,
            ValueError, OSError) as e:
        logger.exception("시장 비교 API 호출 실패")
        raise HTTPException(
            status_code=502,
            detail="시장 비교 데이터를 가져오지 못했습니다."
        ) from e

    # 4. Gemini 최종 결론 생성
    try:
        result = analyze_final_conclusion(
            stock_name=stock["stock_name"],
            news_data=news_data,
            market_data=market_data
        )

        # 분석에 사용된 뉴스 건수 및 시점 표시
        result["newsCount"] = len(news_data)
        result["latestNewsAt"] = (
            max(
                (
                    item["publishedAt"]
                    for item in news_data
                    if item["publishedAt"]
                ),
                default=None
            )
        )

        return result

    except Exception as e:
        logger.exception(
            "Gemini 최종 결론 생성 실패 (stock_code=%s)",
            stock_code
        )
        raise HTTPException(
            status_code=500,
            detail="AI 최종 결론 생성 중 오류가 발생했습니다."
        ) from e

@app.get("/api/ai/sentiment-stats/{stock_code}")
def get_sentiment_stats(stock_code: str):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                LOWER(s.label) AS label,
                COUNT(*) AS news_count
            FROM news_articles a
            JOIN news_sentiments s
                ON a.article_id = s.article_id
            WHERE a.stock_code = %s
              AND a.analysis_status = 'DONE'
              AND s.label IN ('positive', 'neutral', 'negative')
              AND a.published_at >= NOW() - INTERVAL 7 DAY
              AND a.published_at <= NOW()
            GROUP BY LOWER(s.label)
            """,
            (stock_code,)
        )

        rows = cursor.fetchall()

        counts = {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        }

        for row in rows:
            counts[row["label"]] = int(row["news_count"])

        total = sum(counts.values())

        if total == 0:
            return {
                "stockCode": stock_code,
                "totalCount": 0,
                "sentimentScore": None,
                "sentimentStatus": "분석 데이터 없음",
                "sentimentBreakdown": {
                    "positive": 0,
                    "neutral": 0,
                    "negative": 0
                }
            }

        positive = counts["positive"] / total * 100
        neutral = counts["neutral"] / total * 100
        negative = counts["negative"] / total * 100

        score = round(
            (counts["positive"] + 0.5 * counts["neutral"])
            / total * 100
        )

        if score >= 70:
            status = "긍정"
        elif score >= 40:
            status = "중립"
        else:
            status = "부정"

        return {
            "stockCode": stock_code,
            "totalCount": total,
            "sentimentScore": score,
            "sentimentStatus": status,
            "sentimentBreakdown": {
                "positive": round(positive, 1),
                "neutral": round(neutral, 1),
                "negative": round(negative, 1)
            }
        }

    except Exception as e:
        logger.exception(
            "감성 통계 조회 실패 (stock_code=%s)", stock_code
        )
        raise HTTPException(
            status_code=500,
            detail="감성 통계 조회 중 오류가 발생했습니다."
        ) from e

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


@app.get("/api/terms/today")
def get_today_term():
    conn = None
    cursor = None

    try:
        # 한국 시간 기준 오늘 날짜
        today = datetime.now(
            ZoneInfo("Asia/Seoul")
        ).date()

        # 기존 프로젝트 DB 연결 함수 사용
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT term_id, term, description, source
            FROM stock_terms
            ORDER BY term_id
        """)

        terms = cursor.fetchall()

        if not terms:
            raise HTTPException(
                status_code=404,
                detail="등록된 주식 용어가 없습니다."
            )

        # 날짜별로 하나의 용어 선택
        index = today.toordinal() % len(terms)
        selected = terms[index]

        return {
            "date": today.isoformat(),
            "term": selected["term"],
            "description": selected["description"],
            "source": selected["source"]
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.exception("오늘의 주식 용어 조회 실패")
        raise HTTPException(
            status_code=500,
            detail="주식 용어 조회 중 오류가 발생했습니다."
        ) from e

    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()
