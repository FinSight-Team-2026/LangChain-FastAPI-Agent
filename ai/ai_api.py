
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
