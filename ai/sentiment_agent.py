
import json
from pathlib import Path

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


# 1. 환경변수 설정
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)


# 2. Gemini 모델 설정
llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    timeout=15,
    max_retries=0
)


# 3. 뉴스 감성 분석 및 요약 프롬프트
prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """당신은 한국 주식 뉴스 분석 전문가입니다.

주어진 뉴스가 해당 종목에 미치는 영향을 분석하세요.

감성 분류 기준:
- positive: 해당 종목에 긍정적인 영향
- negative: 해당 종목에 부정적인 영향
- neutral: 영향이 불분명하거나 중립적

요약 기준:
- 뉴스의 핵심 내용을 한국어로 정확히 3문장 요약
- 뉴스에 없는 사실은 추가하지 않음
- 객관적이고 간결하게 작성

감성 점수 기준:
- -1.0 ~ -0.1: 부정적 영향
- 0.0: 중립적 영향
- 0.1 ~ 1.0: 긍정적 영향
- 점수는 해당 종목에 대한 뉴스의 예상 영향 방향과 강도를 나타냄
- 주가 상승률이나 하락률을 예측하는 수치가 아님
- 반드시 -1.0 이상 1.0 이하의 숫자로 반환

반드시 다음 JSON 형식으로만 응답하세요.
마크다운 코드 블록은 사용하지 마세요.

{{
  "sentiment": "positive",
  "score": 0.75,
  "summary": [
    "첫 번째 요약 문장",
    "두 번째 요약 문장",
    "세 번째 요약 문장"
  ]
}}"""
    ),
    (
        "human",
        "종목명: {stock_name}\n뉴스 제목: {title}\n뉴스 내용: {content}"
    )
])


# 4. LangChain 체인 구성
chain = prompt | llm


# 5. Gemini 응답에서 텍스트 추출
def extract_text(response):
    if isinstance(response.content, str):
        return response.content

    return "".join(
        block.get("text", "")
        for block in response.content
        if isinstance(block, dict) and block.get("type") == "text"
    )


# 6. 뉴스 감성 분석 및 3줄 요약
def analyze_news(stock_name, title, content):
    response = chain.invoke({
        "stock_name": stock_name,
        "title": title,
        "content": content
    })

    result = json.loads(extract_text(response).strip())

    # 감성 분류 검증
    sentiment = result.get("sentiment")

    if sentiment not in ("positive", "negative", "neutral"):
        raise ValueError("올바르지 않은 감성 분석 결과입니다.")

    # 감성 점수 검증
    score = result.get("score")

    if (
        isinstance(score, bool)
        or not isinstance(score, (int, float))
        or not -1.0 <= score <= 1.0
    ):
        raise ValueError("감성 점수는 -1.0~1.0 사이의 숫자여야 합니다.")

    # 감성 분류와 점수 일치 여부 검증
    if (
        (sentiment == "positive" and score <= 0)
        or (sentiment == "negative" and score >= 0)
        or (sentiment == "neutral" and score != 0)
    ):
        raise ValueError("감성 분류와 점수가 일치하지 않습니다.")

    # 3줄 요약 검증
    summary = result.get("summary")

    if (
        not isinstance(summary, list)
        or len(summary) != 3
        or not all(isinstance(s, str) and s.strip() for s in summary)
    ):
        raise ValueError("요약 결과는 3개의 문장이어야 합니다.")

    return result