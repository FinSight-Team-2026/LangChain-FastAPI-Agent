# FinSight (Financial + Insight)
LangChain + FastAPI 기반 실시간 주식 뉴스 감성 분석 시스템

## 프로젝트 소개
AI가 실시간 주식 뉴스를 수집 및 분석하여 핵심 3줄 요약과 긍정/부정 점수를 산출하고, 이를 실시간 대시보드로 시각화하는 시스템입니다.

## 디렉토리 구조
```text
FinSight/
├── ai/             # LangChain & LLM 기반 분석 Agent
├── backend/        # FastAPI 백엔드 서버 & WebSocket API
└── frontend/       # React 기반 실시간 감성 분석 대시보드
