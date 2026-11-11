
from news_repository import save_news
from analyze_db_news import analyze_saved_news
from daily_sentiment_repository import update_all_daily_sentiments
from db_connection import get_db_connection


def run_pipeline(stock_code, stock_name):
    print(f"\n[START] {stock_name} 뉴스 분석 시작")

    # 1. 뉴스 수집 및 저장
    save_news(stock_code, stock_name, display=20)

    # 2. 미분석 뉴스 전체 분석
    while True:
        success_count, fail_count = analyze_saved_news(
            stock_code, limit=5
        )

        if success_count == 0:
            break

    # 3. 발행일별 감성 통계 갱신
    update_all_daily_sentiments(stock_code)

    print(f"\n[END] {stock_name} 뉴스 분석 완료")


def run_all_pipelines():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT stock_code, stock_name
            FROM stocks
            ORDER BY stock_code
        """)
        stocks = cursor.fetchall()

    finally:
        cursor.close()
        conn.close()

    print(f"[INFO] 분석 대상 종목: {len(stocks)}개")

    for stock in stocks:
        try:
            run_pipeline(
                stock["stock_code"],
                stock["stock_name"]
            )
        except Exception as e:
            print(
                f"[ERROR] {stock['stock_name']} "
                f"분석 실패: {e}"
            )


if __name__ == "__main__":
    run_all_pipelines()