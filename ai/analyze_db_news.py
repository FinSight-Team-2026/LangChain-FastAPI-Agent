from db_connection import get_db_connection
from sentiment_agent import analyze_news


def analyze_saved_news(stock_code="005930", limit=5):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    success_count = 0
    fail_count = 0

    try:
        # 1. 아직 분석하지 않은 뉴스 조회
        cursor.execute("""
            SELECT
                n.article_id,
                s.stock_name,
                n.title,
                n.content
            FROM news_articles n
            JOIN stocks s
                ON n.stock_code = s.stock_code
            LEFT JOIN news_sentiments ns
                ON n.article_id = ns.article_id
            WHERE n.stock_code = %s
              AND ns.article_id IS NULL
            ORDER BY n.published_at DESC, n.article_id ASC
            LIMIT %s
        """, (stock_code, limit))

        news_list = cursor.fetchall()

        if not news_list:
            print("[INFO] 분석할 뉴스가 없습니다.")
            return 0, 0

        print(f"[INFO] 미분석 뉴스 {len(news_list)}건 조회")

        # 2. 다음 sentiment_id 확인
        cursor.execute("""
            SELECT COALESCE(MAX(sentiment_id), 0) + 1 AS next_id
            FROM news_sentiments
        """)
        next_id = cursor.fetchone()["next_id"]

        # 3. 뉴스별 Gemini 감성 분석
        for news in news_list:
            try:
                result = analyze_news(
                    stock_name=news["stock_name"],
                    title=news["title"],
                    content=news["content"] or ""
                )

                # 4. 분석 결과 DB 저장
                cursor.execute("""
                    INSERT INTO news_sentiments (
                        sentiment_id,
                        article_id,
                        label,
                        score,
                        summary
                    )
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    next_id,
                    news["article_id"],
                    result["sentiment"],
                    result["score"],
                    "\n".join(result["summary"])
                ))

                conn.commit()

                print(
                    f"[OK] 뉴스 ID {news['article_id']} | "
                    f"{result['sentiment']} | "
                    f"score: {result['score']}"
                )

                next_id += 1
                success_count += 1

            except Exception as e:
                conn.rollback()
                fail_count += 1

                print(
                    f"[ERROR] 뉴스 ID {news['article_id']} "
                    f"분석 실패: {e}"
                )

        print("\n========== 분석 결과 ==========")
        print(f"성공: {success_count}건")
        print(f"실패: {fail_count}건")
        return success_count, fail_count

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    analyze_saved_news("005930", 5)