from datetime import date

from db_connection import get_db_connection


def update_daily_sentiment(stock_code, target_date):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1. 해당 날짜의 분석 결과 집계
        cursor.execute("""
            SELECT
                COUNT(*) AS total_articles,
                SUM(CASE WHEN ns.label = 'positive' THEN 1 ELSE 0 END)
                    AS positive_count,
                SUM(CASE WHEN ns.label = 'negative' THEN 1 ELSE 0 END)
                    AS negative_count,
                SUM(CASE WHEN ns.label = 'neutral' THEN 1 ELSE 0 END)
                    AS neutral_count,
                AVG(ns.score) AS avg_score
            FROM news_articles na
            JOIN news_sentiments ns
                ON na.article_id = ns.article_id
            WHERE na.stock_code = %s
              AND DATE(na.published_at) = %s
        """, (stock_code, target_date))

        stats = cursor.fetchone()

        if stats["total_articles"] == 0:
            print("[INFO] 해당 날짜에 분석된 뉴스가 없습니다.")
            return

        # 2. 기존 일일 집계 존재 여부 확인
        cursor.execute("""
            SELECT daily_id
            FROM stock_daily_sentiment
            WHERE stock_code = %s
              AND target_date = %s
            ORDER BY daily_id
            LIMIT 1
        """, (stock_code, target_date))

        existing = cursor.fetchone()

        if existing:
            # 3-A. 기존 집계 UPDATE
            cursor.execute("""
                UPDATE stock_daily_sentiment
                SET
                    total_articles = %s,
                    positive_count = %s,
                    negative_count = %s,
                    neutral_count = %s,
                    avg_score = %s,
                    updated_at = NOW()
                WHERE stock_code = %s
                  AND target_date = %s
            """, (
                stats["total_articles"],
                stats["positive_count"],
                stats["negative_count"],
                stats["neutral_count"],
                stats["avg_score"],
                stock_code,
                target_date
            ))

            action = "UPDATE"

        else:
            # 3-B. 새 daily_id 생성
            cursor.execute("""
                SELECT COALESCE(MAX(daily_id), 0) + 1 AS next_id
                FROM stock_daily_sentiment
            """)

            daily_id = cursor.fetchone()["next_id"]

            # 신규 집계 INSERT
            cursor.execute("""
                INSERT INTO stock_daily_sentiment (
                    daily_id,
                    stock_code,
                    target_date,
                    total_articles,
                    positive_count,
                    negative_count,
                    neutral_count,
                    avg_score,
                    updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            """, (
                daily_id,
                stock_code,
                target_date,
                stats["total_articles"],
                stats["positive_count"],
                stats["negative_count"],
                stats["neutral_count"],
                stats["avg_score"]
            ))

            action = "INSERT"

        conn.commit()

        print(f"[OK] 일일 감성 집계 {action} 완료")
        print(f"종목코드: {stock_code}")
        print(f"집계 날짜: {target_date}")
        print(f"전체 뉴스: {stats['total_articles']}건")
        print(f"긍정: {stats['positive_count']}건")
        print(f"부정: {stats['negative_count']}건")
        print(f"중립: {stats['neutral_count']}건")
        print(f"평균 점수: {stats['avg_score']}")

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()

def update_all_daily_sentiments(stock_code):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT DISTINCT DATE(na.published_at)
            FROM news_articles na
            JOIN news_sentiments ns
                ON na.article_id = ns.article_id
            WHERE na.stock_code = %s
              AND na.published_at IS NOT NULL
            ORDER BY DATE(na.published_at)
        """, (stock_code,))

        dates = [row[0] for row in cursor.fetchall()]

    finally:
        cursor.close()
        conn.close()

    for target_date in dates:
        update_daily_sentiment(stock_code, target_date)

    print(f"[OK] 발행일별 감성 집계 완료: {len(dates)}일")

if __name__ == "__main__":
    update_daily_sentiment("005930", date(2026, 11, 3))