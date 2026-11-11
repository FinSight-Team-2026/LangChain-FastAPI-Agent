from datetime import datetime
from email.utils import parsedate_to_datetime

from db_connection import get_db_connection
from news_crawler import search_news


def save_news(stock_code, stock_name, display=5):
    # 1. 네이버 뉴스 검색
    news_list = search_news(stock_name, display)

    conn = get_db_connection()
    cursor = conn.cursor()

    saved_count = 0
    skipped_count = 0

    try:
        # 2. 기존 뉴스 ID 조회
        cursor.execute(
            "SELECT COALESCE(MAX(article_id), 0) FROM news_articles"
        )
        next_id = cursor.fetchone()[0] + 1

        for news in news_list:
            # 3. URL 중복 확인
            cursor.execute(
                "SELECT article_id FROM news_articles WHERE url = %s",
                (news["url"],)
            )

            if cursor.fetchone():
                skipped_count += 1
                continue

            # 4. 발행일 변환
            published_at = parsedate_to_datetime(
                news["published_at"]
            ).replace(tzinfo=None)

            # 5. 뉴스 데이터 저장
            sql = """
                INSERT INTO news_articles (
                    article_id,
                    stock_code,
                    title,
                    content,
                    url,
                    published_at
                )
                VALUES (%s, %s, %s, %s, %s, %s)
            """

            values = (
                next_id,
                stock_code,
                news["title"],
                news["description"],
                news["url"],
                published_at
            )

            cursor.execute(sql, values)

            next_id += 1
            saved_count += 1

        conn.commit()

        print(f"[OK] 뉴스 저장 완료: {saved_count}건")
        print(f"[SKIP] 중복 뉴스: {skipped_count}건")

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    save_news("005930", "삼성전자", 5)