import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", "3307")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )


if __name__ == "__main__":
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SHOW TABLES")

        print("[OK] MySQL 연결 성공!")

        for table in cursor.fetchall():
            print(table[0])

        cursor.close()
        conn.close()

    except mysql.connector.Error as e:
        print(f"[ERROR] MySQL 연결 실패: {e}")