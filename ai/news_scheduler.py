"""환경변수로 실행 주기를 설정하는 뉴스 수집/분석 스케줄러."""
import argparse
import logging
import os
import threading
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)


def run_once():
    from pipeline import run_all_pipelines
    logger.info('뉴스 수집/분석 시작')
    run_all_pipelines()
    logger.info('뉴스 수집/분석 종료')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--once', action='store_true', help='한 번만 실행 후 종료')
    args = parser.parse_args()
    if args.once:
        run_once()
        return
    hours = float(os.getenv('NEWS_CRAWL_INTERVAL_HOURS', '2'))
    if hours <= 0:
        raise ValueError('NEWS_CRAWL_INTERVAL_HOURS는 0보다 커야 합니다.')
    interval_seconds = hours * 3600
    logger.info('뉴스 스케줄러 시작: %.2f시간 간격 (실행 완료 후 대기)', hours)
    stop_event = threading.Event()
    try:
        while True:
            try:
                run_once()
            except Exception:
                logger.exception('뉴스 수집/분석 작업 오류')
            stop_event.wait(interval_seconds)
    except KeyboardInterrupt:
        logger.info('스케줄러 종료')


if __name__ == '__main__':
    main()
