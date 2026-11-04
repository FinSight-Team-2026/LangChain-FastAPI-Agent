import os
import google.generativeai as genai
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class SentimentResult(BaseModel):
    sentiment: str = Field(description="'positive', 'negative', 'neutral' 중 하나")
    score: float = Field(description="-1.0부터 1.0 사이의 감성 점수")
    summary: str = Field(description="기사의 3줄 핵심 요약")

def analyze_sentiment(title: str, content: str) -> dict:
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"""
    다음 금융/주식 관련 뉴스 기사를 분석하여 JSON 형식으로 결과를 출력해주세요.
    
    제목: {title}
    본문: {content}
    
    반환 형식:
    {{
        "sentiment": "positive" | "negative" | "neutral",
        "score": -1.0 ~ 1.0 사이의 실수,
        "summary": "3줄 요약"
    }}
    """
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    print("[분석 모듈 준비 완료]")
