import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME", "moodondb"),
        port=int(os.getenv("DB_PORT", 3306))
    )

def insert_news(stock_code: str, articles: list):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """
            INSERT INTO news_articles (stock_code, title, content, url, published_at)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE title=VALUES(title)
        """
        for art in articles:
            cursor.execute(sql, (
                stock_code,
                art["title"],
                art["content"],
                art["url"],
                art.get("published_at")
            ))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print("[DB 연동 모듈 준비 완료]")
