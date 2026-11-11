
import json

from final_conclusion_agent import analyze_final_conclusion

# 실제 API에서 확인한 시장 비교 결과
market_data = {
    "stockCode": "005930",
    "startDate": "20261029",
    "endDate": "20261105",
    "matchedDays": 6,
    "stockReturn": -13.15,
    "kospiReturn": -9.33,
    "relativeReturn": -3.82
}

# 첫 테스트에서는 뉴스 없이 시장 비교만 검증
news_data = []

result = analyze_final_conclusion(
    stock_name="삼성전자",
    news_data=news_data,
    market_data=market_data
)

print(json.dumps(
    result,
    ensure_ascii=False,
    indent=2
))
