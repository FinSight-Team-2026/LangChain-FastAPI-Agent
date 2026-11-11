"""기존 mysql.connector DB 연결을 재사용하는 분석 상태 저장소."""
from db_connection import get_db_connection


def fetch_pending(stock_code, limit=5):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute('''
            SELECT a.article_id, a.stock_code, s.stock_name, a.title, a.content
            FROM news_articles a
            JOIN stocks s ON s.stock_code = a.stock_code
            WHERE a.stock_code = %s AND a.analysis_status = 'PENDING'
            ORDER BY a.published_at DESC, a.article_id DESC LIMIT %s
        ''', (stock_code, int(limit)))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


def set_status(article_id, status):
    if status not in ('PENDING', 'DONE', 'IRRELEVANT', 'FAILED'):
        raise ValueError('invalid analysis status')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('UPDATE news_articles SET analysis_status = %s WHERE article_id = %s', (status, article_id))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def save_done(article_id, label, score, summary):
    """기존 news_sentiments 컬럼 구조 유지. 상태와 분석 결과를 한 트랜잭션으로 저장."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        conn.start_transaction()
        cursor.execute('SELECT sentiment_id FROM news_sentiments WHERE article_id = %s FOR UPDATE', (article_id,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute('''UPDATE news_sentiments SET label=%s, score=%s, summary=%s, analyzed_at=NOW()
                              WHERE article_id=%s''', (label, score, summary, article_id))
        else:
            # 현재 프로젝트는 sentiment_id를 수동 할당하는 구조이므로 기존 규칙을 유지한다.
            # 동시 실행 시 MAX+1 충돌 위험이 있어 운영 전 AUTO_INCREMENT 전환 검토 필요.
            cursor.execute('SELECT COALESCE(MAX(sentiment_id), 0) + 1 AS next_id FROM news_sentiments')
            sentiment_id = cursor.fetchone()['next_id']
            cursor.execute('''INSERT INTO news_sentiments
                              (sentiment_id, article_id, label, score, summary, analyzed_at)
                              VALUES (%s, %s, %s, %s, %s, NOW())''',
                           (sentiment_id, article_id, label, score, summary))
        cursor.execute("UPDATE news_articles SET analysis_status = 'DONE' WHERE article_id = %s", (article_id,))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

def get_recent_news_summaries(stock_code, limit=5):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                a.article_id,
                a.stock_code,
                a.title,
                a.url,
                a.published_at,
                s.label AS sentiment,
                s.score,
                s.summary
            FROM news_articles a
            JOIN news_sentiments s
                ON a.article_id = s.article_id
            WHERE a.stock_code = %s
              AND a.analysis_status = 'DONE'
              AND a.published_at >= NOW() - INTERVAL 7 DAY
              AND a.published_at <= NOW()
            ORDER BY a.published_at DESC, a.article_id DESC
            LIMIT %s
        """, (stock_code, int(limit)))

        return cursor.fetchall()

    finally:
        cursor.close()
        conn.close()
