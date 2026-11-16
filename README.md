# MOOD ON

> **FinSight — Financial + Insight**
> 주식 시세와 뉴스 감성 분석을 한곳에서 확인하는 투자 정보 대시보드

MOOD ON은 주식 종목별 시세·뉴스·감성 데이터를 모아 대시보드로 제공하는 웹 애플리케이션입니다. AI 서비스는 뉴스의 종목 관련성 및 긍정·중립·부정 감성을 분석하고, 요약과 종목 분석 결과를 제공합니다.

## 주요 기능

- 종목별 현재 시세와 기간별 주가 차트 조회
- 뉴스 수집, 종목 관련성 판별, 감성 분류 및 요약
- 종목별 일간 감성 통계와 시장 대비 수익률 시각화
- AI 분석 작업 접수 및 상태 조회
- 종목별 주가 방향 분석 및 뉴스 기반 최종 결론
- 관심 종목, 사용자 계정 및 마이페이지

> 분석 결과는 참고 정보이며 투자 권유나 수익을 보장하지 않습니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Java 21, Spring Boot 3, Spring Data JPA, Spring Security |
| AI API | Python, FastAPI, LangChain, Google Gemini |
| Database | MySQL |
| 외부 데이터 | 네이버 뉴스 검색 API, 한국투자증권 Open API |

## 아키텍처

```text
┌─────────────────────┐       ┌──────────────────────────┐
│ React / Vite        │ ────▶ │ Spring Boot API          │
│ localhost:3000      │       │ localhost:8080           │
└─────────────────────┘       └────────────┬─────────────┘
                                            │
                         ┌──────────────────┴─────────────────┐
                         ▼                                    ▼
                ┌─────────────────┐                  ┌────────────────┐
                │ MySQL           │                  │ FastAPI / AI   │
                │ mood_on_db      │                  │ localhost:8001 │
                └─────────────────┘                  └────────────────┘
```

## 시작하기

### 사전 준비

- Java 21
- Node.js 및 npm (Vite 8 실행이 가능한 버전)
- Python 3.10 이상
- MySQL
- Google Gemini API 키, 네이버 뉴스 검색 API 키
- 시세 연동을 사용할 경우 한국투자증권 Open API 키

### 1. 데이터베이스 설정

종목 테이블을 만든 뒤 아래 SQL로 초기 종목 데이터를 넣을 수 있습니다.

```sql
source backend/insert_stocks.sql;
```

`backend/insert_stocks.sql`은 종목 데이터를 삽입하는 파일이며, 전체 데이터베이스 스키마를 생성하지는 않습니다.

### 2. 환경변수 및 API 키 설정

AI 서비스의 `ai/.env` 파일을 만들고 실제 값으로 채웁니다. 이 파일과 API 키를 Git에 커밋하지 마세요.

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_db_name

GOOGLE_API_KEY=your_google_gemini_api_key
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

SPRING_BOOT_URL=http://127.0.0.1:8080
```

Spring Boot의 DB 접속 정보와 한국투자증권 API 키도 로컬 실행 환경에 맞게 설정하세요. 민감한 값은 `backend/src/main/resources/application.properties`에 직접 넣어 공개 저장소에 올리지 말고, 환경변수나 별도의 로컬 전용 설정으로 관리하세요.

### 3. AI API 실행

프로젝트에 Python 의존성 목록 파일이 없으므로 가상환경에 필요한 패키지를 설치합니다.

```powershell
cd ai
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install fastapi "uvicorn[standard]" python-dotenv mysql-connector-python requests langchain-google-genai
python -m uvicorn ai_api:app --reload --host 0.0.0.0 --port 8001
```

AI 상태 확인: `http://localhost:8001/api/ai/health`

### 4. Spring Boot Backend 실행

새 터미널에서 다음 명령을 실행합니다.

```powershell
cd backend
.\gradlew.bat bootRun
```

API 서버 기본 주소는 `http://localhost:8080`입니다.

### 5. Frontend 실행

새 터미널에서 다음 명령을 실행합니다.

```powershell
cd frontend
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 주요 AI API

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/api/ai/health` | AI 서비스 상태 확인 |
| `POST` | `/api/ai/analyze/{stock_code}` | 종목 뉴스 분석 작업 요청 |
| `GET` | `/api/ai/jobs/{job_id}` | 분석 작업 상태 조회 |
| `GET` | `/api/ai/prediction/{stock_code}?as_of_date=YYYY-MM-DD` | 기준일 기준 주가 방향 분석 |
| `GET` | `/api/ai/news-summary/{stock_code}?limit=5` | 최근 뉴스 요약 조회 |
| `GET` | `/api/ai/final-conclusion/{stock_code}` | 뉴스 및 시장 데이터를 이용한 최종 분석 |

## 개발 명령어

Frontend:

```powershell
npm run dev
npm run lint
npm run build
```

Backend:

```powershell
.\gradlew.bat test
.\gradlew.bat bootRun
```

## 구성 및 실행 참고

- Frontend는 `localhost:8080`의 Spring Boot API를 사용합니다.
- Spring의 `AiAnalysisController`는 별도 설정이 없으면 FastAPI를 `localhost:8001`에서 찾습니다. 반면 `SentimentAiClientService`는 `localhost:8000`을 사용하므로, 두 서비스 주소를 실행 환경에 맞게 일치시켜야 해당 연동이 모두 동작합니다.
- 뉴스 수집 및 감성 분석을 한 번 실행하려면 AI 환경을 설정한 뒤 `ai` 디렉터리에서 `python news_scheduler.py --once`를 실행합니다. 주기 실행은 `NEWS_CRAWL_INTERVAL_HOURS`로 간격을 설정할 수 있으며 기본값은 2시간입니다.
- Spring Boot와 AI 서비스 모두 MySQL 연결이 필요합니다. AI에서 Google Gemini 및 네이버 뉴스 API를 사용하는 기능은 해당 API 키가 설정되어야 합니다.

## 디렉터리 구조

```text
.
├── ai/          # FastAPI, 뉴스 수집 및 Gemini 분석 파이프라인
├── backend/     # Spring Boot REST API 및 도메인 로직
└── frontend/    # React 대시보드
```
