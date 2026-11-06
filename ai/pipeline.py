import os

from news_repository import save_news
from analyze_db_news import analyze_saved_news
from daily_sentiment_repository import update_all_daily_sentiments
from db_connection import get_db_connection


def run_pipeline(stock_code, stock_name):
    print(f'\n[START] {stock_name} 뉴스 분석 시작')
    # 환경변수로 수집량/범위를 조정. 기존 호출 구조 유지.
    display = int(os.getenv('NEWS_PAGE_SIZE', '20'))
    pages = int(os.getenv('NEWS_PAGES', '2'))
    days = int(os.getenv('NEWS_LOOKBACK_DAYS', '7'))
    save_news(stock_code, stock_name, display=display, pages=pages, days=days)

    while True:
        success_count, fail_count = analyze_saved_news(stock_code, limit=5)
        if success_count == 0:
            if fail_count:
                print(f'[WARN] {stock_name}: 분석 실패 {fail_count}건. FAILED 상태를 확인하세요.')
            break
    update_all_daily_sentiments(stock_code)
    print(f'[END] {stock_name} 뉴스 분석 완료')


def run_all_pipelines():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute('SELECT stock_code, stock_name FROM stocks ORDER BY stock_code')
        stocks = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    print(f'[INFO] 분석 대상 종목: {len(stocks)}개')
    for stock in stocks:
        try:
            run_pipeline(stock['stock_code'], stock['stock_name'])
        except Exception as exc:
            print(f"[ERROR] {stock['stock_name']} 분석 실패: {exc}")


if __name__ == '__main__':
    run_all_pipelines()
