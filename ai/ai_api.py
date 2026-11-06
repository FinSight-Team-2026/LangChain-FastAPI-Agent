from pipeline import run_pipeline
from news_price_analyzer import (
    analyze_news_timing,
    calculate_session_agreement
)
from datetime import datetime
from threading import Lock
from uuid import uuid4
from fastapi import FastAPI, HTTPException, BackgroundTasks

from db_connection import get_db_connection
from pipeline import run_pipeline


app = FastAPI(title="MOOD ON? AI API")

# 작업 상태를 메모리에 저장
jobs = {}
jobs_lock = Lock()


@app.get("/api/ai/health")
def health_check():
    return {
        "status": "ok",
        "service": "MOOD ON? AI"
    }


def execute_analysis(job_id, stock_code, stock_name):
    # 작업 시작
    with jobs_lock:
        jobs[job_id]["status"] = "running"
        jobs[job_id]["started_at"] = datetime.now().isoformat()

    try:
        # 기존 AI 파이프라인 실행
        run_pipeline(stock_code, stock_name)

        with jobs_lock:
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["completed_at"] = datetime.now().isoformat()

    except Exception as e:
        with jobs_lock:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = str(e)
            jobs[job_id]["completed_at"] = datetime.now().isoformat()


@app.post("/api/ai/analyze/{stock_code}", status_code=202)
def analyze_stock(stock_code: str, background_tasks: BackgroundTasks):
    conn = None
    cursor = None

    try:
        # 등록된 종목 확인
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT stock_code, stock_name
            FROM stocks
            WHERE stock_code = %s
            """,
            (stock_code,)
        )

        stock = cursor.fetchone()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="종목 조회 중 DB 오류가 발생했습니다."
        )

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

    if stock is None:
        raise HTTPException(
            status_code=404,
            detail="등록되지 않은 종목입니다."
        )

    # 동일 종목의 분석 작업 중복 방지
    with jobs_lock:
        for job in jobs.values():
            if (
                job["stock_code"] == stock_code
                and job["status"] in ("pending", "running")
            ):
                raise HTTPException(
                    status_code=409,
                    detail="해당 종목은 이미 분석 중입니다."
                )

        job_id = str(uuid4())

        jobs[job_id] = {
            "job_id": job_id,
            "stock_code": stock_code,
            "stock_name": stock["stock_name"],
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "started_at": None,
            "completed_at": None,
            "error": None
        }

    # 백그라운드 작업 등록
    background_tasks.add_task(
        execute_analysis,
        job_id,
        stock_code,
        stock["stock_name"]
    )

    return {
        "job_id": job_id,
        "stock_code": stock_code,
        "status": "pending",
        "message": "AI 분석 요청이 접수되었습니다."
    }


@app.get("/api/ai/jobs/{job_id}")
def get_job_status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)

        if job is None:
            raise HTTPException(
                status_code=404,
                detail="존재하지 않는 작업입니다."
            )

        return job.copy()


@app.get("/api/ai/news-price/{stock_code}")
def get_news_price_analysis(stock_code: str):
    conn = None
    cursor = None

    try:
        # 1. 종목 등록 여부 확인
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT 1 FROM stocks WHERE stock_code = %s",
            (stock_code,)
        )

        if cursor.fetchone() is None:
            raise HTTPException(
                status_code=404,
                detail="등록되지 않은 종목입니다."
            )

        # 2. 기존 뉴스·주가 시차 분석 실행
        result = analyze_news_timing(stock_code)

        # 3. 분석 결과와 데이터 상태 반환
        return result

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="뉴스·주가 분석 중 오류가 발생했습니다."
        )

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()



@app.get("/api/ai/session-statistics/{stock_code}")
def get_session_statistics(stock_code: str):
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 등록된 종목인지 확인
        cursor.execute(
            "SELECT 1 FROM stocks WHERE stock_code = %s",
            (stock_code,)
        )

        if cursor.fetchone() is None:
            raise HTTPException(
                status_code=404,
                detail="등록되지 않은 종목입니다."
            )

        # 시간대별 뉴스·주가 일치율 계산
        result = calculate_session_agreement(stock_code)

        return result

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="시간대별 뉴스·주가 통계 조회 중 오류가 발생했습니다."
        )

    finally:
        if cursor is not None:
            cursor.close()

        if conn is not None:
            conn.close()


from datetime import date
from fastapi import Query
from prediction_agent import (
    prepare_prediction_data,
    predict_stock_direction
)



@app.get("/api/ai/prediction/{stock_code}")
def get_stock_prediction(
    stock_code: str,
    as_of_date: date = Query(...)
):
    try:
        # date 객체를 문자열로 변환
        date_str = as_of_date.isoformat()

        data = prepare_prediction_data(
            stock_code,
            date_str
        )

        result = predict_stock_direction(
            stock_code=stock_code,
            as_of_date=date_str,
            analysis_data=data
        )

        return result

    except Exception:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="주가 방향 예측 중 오류가 발생했습니다."
        )
