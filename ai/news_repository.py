"""기존 news_articles 스키마를 유지하는 저장소."""
from datetime import timedelta, timezone
from email.utils import parsedate_to_datetime

from db_connection import get_db_connection
from news_crawler import search_news

KST = timezone(timedelta(hours=9))


def save_news(stock_code, stock_name, display=5, pages=1, days=None):
    news_list = search_news(stock_name, display=display, pages=pages, days=days)
    conn = get_db_connection()
    cursor = conn.cursor()
    saved_count = 0
    skipped_count = 0
    try:
        # 기존 수동 ID 발급 스키마와 호환. 동시에 여러 프로세스에서
        # 실행하지 말 것. 장기적으로 AUTO_INCREMENT/UNIQUE(url) 권장.
        cursor.execute('SELECT COALESCE(MAX(article_id), 0) FROM news_articles')
        next_id = cursor.fetchone()[0] + 1
        for news in news_list:
            cursor.execute('SELECT article_id FROM news_articles WHERE url = %s', (news['url'],))
            if cursor.fetchone():
                skipped_count += 1
                continue
            published_dt = parsedate_to_datetime(news['published_at'])
            if published_dt.tzinfo is not None:
                published_dt = published_dt.astimezone(KST).replace(tzinfo=None)
            cursor.execute('''
                INSERT INTO news_articles (article_id, stock_code, title, content, url, published_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (next_id, stock_code, news['title'], news['description'], news['url'], published_dt))
            next_id += 1
            saved_count += 1
        conn.commit()
        print(f'[OK] {stock_name}: 신규 {saved_count}건, 중복 {skipped_count}건')
        return saved_count, skipped_count
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    save_news('005930', '삼성전자', display=5)
