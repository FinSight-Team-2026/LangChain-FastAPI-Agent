"""네이버 뉴스 검색 API 기반 수집 (검색 결과의 제목/설명만 수집)."""
import html
import os
import re
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

import requests
from dotenv import load_dotenv

load_dotenv()
KST = timezone(timedelta(hours=9))
API_URL = 'https://naverapihub.apigw.ntruss.com/search/v1/news'


def search_news(stock_name, display=10, pages=1, days=None):
    """최신순 최대 pages 페이지 수집. display=페이지당 건수(1~100).

    days=None이면 날짜 제한 없음. 네이버 검색 API 자체가 과거 전체 기사
    검색을 보장하지 않으므로 이 함수는 완전한 과거 기사 백필 도구가 아님.
    """
    display = int(display)
    pages = int(pages)
    if not 1 <= display <= 100 or not 1 <= pages <= 10:
        raise ValueError('display는 1~100, pages는 1~10이어야 합니다.')
    if days is not None and int(days) < 1:
        raise ValueError('days는 1 이상이어야 합니다.')

    client_id = os.getenv('NAVER_CLIENT_ID')
    client_secret = os.getenv('NAVER_CLIENT_SECRET')
    if not client_id or not client_secret:
        raise RuntimeError('NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수를 확인하세요.')
    headers = {
        'X-NCP-APIGW-API-KEY-ID': client_id,
        'X-NCP-APIGW-API-KEY': client_secret,
    }
    cutoff = (datetime.now(KST) - timedelta(days=int(days))) if days is not None else None
    news_list = []
    seen_urls = set()
    with requests.Session() as session:
        for page in range(pages):
            start = 1 + page * display
            if start + display - 1 > 1000:
                break
            response = session.get(
                API_URL,
                headers=headers,
                params={'query': stock_name, 'display': display, 'start': start, 'sort': 'date'},
                timeout=10,
            )
            response.raise_for_status()
            items = response.json().get('items', [])
            if not items:
                break
            reached_cutoff = False
            for item in items:
                published_at = item.get('pubDate')
                if not published_at:
                    continue
                published_dt = parsedate_to_datetime(published_at)
                if published_dt.tzinfo is None:
                    published_dt = published_dt.replace(tzinfo=KST)
                if cutoff is not None and published_dt.astimezone(KST) < cutoff:
                    reached_cutoff = True
                    continue
                url = item.get('originallink') or item.get('link')
                if not url or url in seen_urls:
                    continue
                seen_urls.add(url)
                news_list.append({
                    'title': html.unescape(re.sub(r'<[^>]+>', '', item.get('title', ''))),
                    'description': html.unescape(re.sub(r'<[^>]+>', '', item.get('description', ''))),
                    'url': url,
                    'published_at': published_at,
                })
            if len(items) < display or reached_cutoff:
                break
    print(f'[CRAWL] {stock_name}: {len(news_list)}건 조회')
    return news_list


if __name__ == '__main__':
    for article in search_news('삼성전자', display=5):
        print(article['title'], article['published_at'])
