<<<<<<< HEAD
import os
import re
import html
from urllib import response
=======

import os
import re
import html
>>>>>>> 693164450bd2068b7011fb1b0b4c3fa33145e219
import requests
from dotenv import load_dotenv

load_dotenv()

<<<<<<< HEAD
print("Client ID 존재:", bool(os.getenv("NAVER_CLIENT_ID")))
print("Client Secret 존재:", bool(os.getenv("NAVER_CLIENT_SECRET")))

def search_news(stock_name, display=10):
=======
# 종목별 뉴스 검색어
STOCK_SEARCH_QUERIES = {
    "삼성전자": "삼성전자 실적",
    "SK하이닉스": "SK하이닉스 실적",
    "NAVER": "네이버 주가",
    "현대자동차": "현대차 실적",
    "LG에너지솔루션": "LG에너지솔루션 실적",
}


def search_news(stock_name, display=20):
>>>>>>> 693164450bd2068b7011fb1b0b4c3fa33145e219
    url = "https://naverapihub.apigw.ntruss.com/search/v1/news"

    headers = {
        "X-NCP-APIGW-API-KEY-ID": os.getenv("NAVER_CLIENT_ID"),
        "X-NCP-APIGW-API-KEY": os.getenv("NAVER_CLIENT_SECRET")
    }

<<<<<<< HEAD
    params = {
        "query": stock_name,
=======
    query = STOCK_SEARCH_QUERIES.get(stock_name, stock_name)

    params = {
        "query": query,
>>>>>>> 693164450bd2068b7011fb1b0b4c3fa33145e219
        "display": display,
        "sort": "date"
    }

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=10
    )
<<<<<<< HEAD
    
    print("HTTP 상태:", response.status_code)
    print("API 응답:", response.text)
=======

    print(f"[NEWS] 종목: {stock_name}")
    print(f"[NEWS] 검색어: {query}")
    print(f"[NEWS] HTTP 상태: {response.status_code}")
>>>>>>> 693164450bd2068b7011fb1b0b4c3fa33145e219

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
<<<<<<< HEAD
    news = search_news("삼성전자", 5)
=======
    news = search_news("NAVER", 20)
>>>>>>> 693164450bd2068b7011fb1b0b4c3fa33145e219

    for article in news:
        print("제목:", article["title"])
        print("요약:", article["description"])
<<<<<<< HEAD
        print("URL:", article["url"])
        print("발행일:", article["published_at"])
        print("-" * 50)
=======
        print("발행일:", article["published_at"])
        print("-" * 50)
>>>>>>> 693164450bd2068b7011fb1b0b4c3fa33145e219
