import os
import re
import html
from urllib import response
import requests
from dotenv import load_dotenv

load_dotenv()

print("Client ID 존재:", bool(os.getenv("NAVER_CLIENT_ID")))
print("Client Secret 존재:", bool(os.getenv("NAVER_CLIENT_SECRET")))

def search_news(stock_name, display=10):
    url = "https://naverapihub.apigw.ntruss.com/search/v1/news"

    headers = {
        "X-NCP-APIGW-API-KEY-ID": os.getenv("NAVER_CLIENT_ID"),
        "X-NCP-APIGW-API-KEY": os.getenv("NAVER_CLIENT_SECRET")
    }

    params = {
        "query": stock_name,
        "display": display,
        "sort": "date"
    }

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=10
    )
    
    print("HTTP 상태:", response.status_code)
    print("API 응답:", response.text)

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
    news = search_news("삼성전자", 5)

    for article in news:
        print("제목:", article["title"])
        print("요약:", article["description"])
        print("URL:", article["url"])
        print("발행일:", article["published_at"])
        print("-" * 50)