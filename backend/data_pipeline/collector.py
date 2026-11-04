import os
import requests
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("NCP_CLIENT_ID")
CLIENT_SECRET = os.getenv("NCP_CLIENT_SECRET")
API_URL = "https://naverapihub.apigw.ntruss.com/search/v1/news"

def collect_news(query: str, display: int = 10):
    headers = {
        "X-NCP-APIGW-API-KEY-ID": CLIENT_ID,
        "X-NCP-APIGW-API-KEY": CLIENT_SECRET
    }
    params = {
        "query": query,
        "display": display,
        "sort": "date"
    }
    
    response = requests.get(API_URL, headers=headers, params=params)
    if response.status_code != 200:
        raise Exception(f"API 요청 실패: {response.status_code} - {response.text}")
        
    items = response.json().get("items", [])
    news_data = []
    for item in items:
        news_data.append({
            "title": item.get("title", "").replace("<b>", "").replace("</b>", "").replace("&quot;", "\""),
            "content": item.get("description", "").replace("<b>", "").replace("</b>", "").replace("&quot;", "\""),
            "url": item.get("originallink") or item.get("link"),
            "published_at": item.get("pubDate")
        })
    return news_data

if __name__ == "__main__":
    articles = collect_news("삼성전자", display=3)
    print(f"[수집 완료] {len(articles)}건")
