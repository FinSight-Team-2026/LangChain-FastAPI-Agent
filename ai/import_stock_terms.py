
import os
import json
import mysql.connector
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = BASE_DIR / "moodon_stock_terms_100.json"

# ai/.env 또는 프로젝트 루트의 .env 탐색
env_path = BASE_DIR / ".env"

if not env_path.exists():
    env_path = BASE_DIR.parent / ".env"

load_dotenv(env_path)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT") or 3306),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "charset": "utf8mb4",
    "use_pure": True
}

def import_terms():
    with open(JSON_PATH, "r", encoding="utf-8-sig") as f:
        terms = json.load(f)

    if not isinstance(terms, list):
        raise ValueError("JSON 데이터는 배열이어야 합니다.")

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    try:
        sql = """
            INSERT INTO stock_terms (term, description, source)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                description = VALUES(description),
                source = VALUES(source)
        """

        for item in terms:
            cursor.execute(
                sql,
                (
                    item["term"],
                    item["description"],
                    item["source"]
                )
            )

        conn.commit()

        cursor.execute("SELECT COUNT(*) FROM stock_terms")
        count = cursor.fetchone()[0]

        print("주식 용어 저장 완료!")
        print(f"JSON 용어 수: {len(terms)}개")
        print(f"DB 전체 용어 수: {count}개")

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    import_terms()
