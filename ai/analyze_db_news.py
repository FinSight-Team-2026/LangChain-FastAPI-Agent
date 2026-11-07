"""기존 pipeline.py가 호출하는 analyze_saved_news(stock_code, limit=5) 유지."""
from analysis_repo import fetch_pending, save_done, set_status
from sentiment_agent import analyze_news


def analyze_saved_news(stock_code, limit=5):
    """(성공 건수, 실패 건수)를 반환. 무관한 기사도 처리 성공으로 집계."""
    articles = fetch_pending(stock_code, limit=limit)
    success_count, fail_count = 0, 0
    for article in articles:
        article_id = article['article_id']
        try:
            result = analyze_news(article['stock_name'], article['title'], article['content'])
            if not result['is_relevant']:
                set_status(article_id, 'IRRELEVANT')
                print(f"[IRRELEVANT] {article_id}: {result.get('reason', '')}")
            else:
                save_done(article_id, result['sentiment'], result['score'], '\n'.join(result['summary']))
                print(f"[DONE] {article_id}: {result['sentiment']} / {result['score']}")
            success_count += 1
        except Exception as exc:
            fail_count += 1
            print(f'[FAILED] {article_id}: {type(exc).__name__}: {exc}')
            try:
                set_status(article_id, 'FAILED')
            except Exception as status_exc:
                # 상태 업데이트까지 실패하면 반복 조회 위험이 있으므로 즉시 상위로 전달.
                raise RuntimeError(f'기사 {article_id} 상태 저장 실패') from status_exc
    return success_count, fail_count


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('stock_code', help='분석 대상 종목코드 (예: 035420)')
    parser.add_argument('--limit', type=int, default=5)
    args = parser.parse_args()
    print('성공/무관 처리, 실패:', analyze_saved_news(args.stock_code, args.limit))
