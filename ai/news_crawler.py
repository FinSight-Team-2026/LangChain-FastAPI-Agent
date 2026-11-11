
import os
import re
import html
import requests
from dotenv import load_dotenv

load_dotenv()

# 종목별 뉴스 검색어
STOCK_SEARCH_QUERIES = {
    "삼성전자": "삼성전자 실적",
    "SK하이닉스": "SK하이닉스 실적",
    "NAVER": "네이버 주가",
    "현대자동차": "현대차 실적",
    "LG에너지솔루션": "LG에너지솔루션 실적",
}


def search_news(stock_name, display=20):
    url = "https://naverapihub.apigw.ntruss.com/search/v1/news"

    headers = {
        "X-NCP-APIGW-API-KEY-ID": os.getenv("NAVER_CLIENT_ID"),
        "X-NCP-APIGW-API-KEY": os.getenv("NAVER_CLIENT_SECRET")
    }

    query = STOCK_SEARCH_QUERIES.get(stock_name, stock_name)

    params = {
        "query": query,
        "display": display,
        "sort": "date"
    }

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=10
    )

    print(f"[NEWS] 종목: {stock_name}")
    print(f"[NEWS] 검색어: {query}")
    print(f"[NEWS] HTTP 상태: {response.status_code}")

    response.raise_for_status()

    items = response.json().get("items", [])

    news_list = []

    for item in items:
        title = html.unescape(
            re.sub(r"<[^>]+>", "", item["title"])
        )

        description = html.unescape(
            re.sub(r"<[^>]+>", "", item["description"])
        )

        news_list.append({
            "title": title,
            "description": description,
            "url": item.get("originallink") or item["link"],
            "published_at": item["pubDate"]
        })

    return news_list


if __name__ == "__main__":
    news = search_news("NAVER", 20)

    for article in news:
        print("제목:", article["title"])
        print("요약:", article["description"])
        print("발행일:", article["published_at"])
        print("-" * 50)
