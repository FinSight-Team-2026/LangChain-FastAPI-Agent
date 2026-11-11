"""기존 pipeline.py가 호출하는 analyze_saved_news(stock_code, limit=5) 유지."""
from analysis_repo import fetch_pending, save_done, set_status
from sentiment_agent import analyze_news



def analyze_saved_news(stock_code, limit=5):
    """뉴스 분석 후 (성공 건수, 실패 건수) 반환."""

    articles = fetch_pending(stock_code, limit=limit)
    success_count, fail_count = 0, 0

    for article in articles:
        article_id = article["article_id"]

        try:
            result = analyze_news(
                article["stock_name"],
                article["title"],
                article["content"]
            )

            if not result["is_relevant"]:
                set_status(article_id, "IRRELEVANT")

                print(
                    f"[IRRELEVANT] {article_id}: "
                    f"{result.get('reason', '')}"
                )

            else:
                save_done(
                    article_id,
                    result["sentiment"],
                    result["score"],
                    "\n".join(result["summary"])
                )

                print(
                    f"[DONE] {article_id}: "
                    f"{result['sentiment']} / {result['score']}"
                )

            success_count += 1

        except Exception as exc:
            message = str(exc).lower()

            is_rate_limit = (
                "429" in message
                or "resource_exhausted" in message
                or "quota exceeded" in message
            )

            if is_rate_limit:
                print(
                    f"[RATE LIMIT] 기사 {article_id}: "
                    "Gemini 한도 초과. 다음 실행에서 재시도합니다."
                )

                # PENDING 상태 유지 후 상위 파이프라인 중단
                raise RuntimeError(
                    f"Gemini API 요청 제한으로 분석 중단: {article_id}"
                ) from exc

            fail_count += 1

            print(
                f"[FAILED] {article_id}: "
                f"{type(exc).__name__}: {exc}"
            )

            try:
                set_status(article_id, "FAILED")

            except Exception as status_exc:
                raise RuntimeError(
                    f"기사 {article_id} 상태 저장 실패"
                ) from status_exc

    return success_count, fail_count


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('stock_code', help='분석 대상 종목코드 (예: 035420)')
    parser.add_argument('--limit', type=int, default=5)
    args = parser.parse_args()
    print('성공/무관 처리, 실패:', analyze_saved_news(args.stock_code, args.limit))
