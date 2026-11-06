
from db_connection import get_db_connection


def get_stock_prices(stock_code):
    """종목별 일별 주가 데이터 조회"""
    conn = get_db_connection()
    cursor = None

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                stock_code,
                trade_date,
                close_price,
                change_rate
            FROM stock_prices
            WHERE stock_code = %s
            ORDER BY trade_date ASC
            """,
            (stock_code,)
        )
        return cursor.fetchall()

    finally:
        if cursor is not None:
            cursor.close()
        conn.close()


def get_news_sentiments(stock_code):
    """종목별 감성 분석 완료 뉴스 조회"""
    conn = get_db_connection()
    cursor = None

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                n.article_id,
                n.stock_code,
                n.title,
                n.published_at,
                s.label,
                s.score,
                s.analyzed_at
            FROM news_articles n
            JOIN news_sentiments s
                ON n.article_id = s.article_id
            WHERE n.stock_code = %s AND n.analysis_status = 'DONE'
              AND n.published_at IS NOT NULL
            ORDER BY n.published_at ASC
            """,
            (stock_code,)
        )
        return cursor.fetchall()

    finally:
        if cursor is not None:
            cursor.close()
        conn.close()


if __name__ == "__main__":
    stock_code = "005930"

    prices = get_stock_prices(stock_code)
    news = get_news_sentiments(stock_code)

    print(f"종목코드: {stock_code}")
    print(f"주가 데이터: {len(prices)}건")
    print(f"감성 분석 뉴스: {len(news)}건")

    if prices:
        print("주가 예시:", prices[0])

    if news:
        print("뉴스 예시:", news[0])
