-- MOOD_ON Database Schema (MySQL / MariaDB)
CREATE DATABASE IF NOT EXISTS mood_on_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mood_on_db;

-- 1. 사용자 계정 정보 테이블
CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) DEFAULT NULL,
  nickname VARCHAR(100) DEFAULT NULL,
  password VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 계정 정보';

-- 2. 주식 종목 정보 테이블
CREATE TABLE IF NOT EXISTS stocks (
  stock_code VARCHAR(10) NOT NULL PRIMARY KEY,
  stock_name VARCHAR(100) NOT NULL,
  current_price INT DEFAULT 0,
  change_rate DECIMAL(5,2) DEFAULT 0.00,
  volume BIGINT DEFAULT 0,
  trading_value BIGINT DEFAULT 0,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  market VARCHAR(20) DEFAULT 'KOSPI',
  market_type VARCHAR(10) DEFAULT 'KOSPI'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='주식 종목 및 실시간 시세 요약 정보';

-- 3. 사용자별 관심 종목 목록 테이블
CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  stock_code VARCHAR(255) NOT NULL,
  stock_name VARCHAR(255) DEFAULT NULL,
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자별 관심 종목 목록';

-- 4. 주식 일별 시세 정보 테이블
CREATE TABLE IF NOT EXISTS stock_prices (
  price_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stock_code VARCHAR(20) NOT NULL,
  trade_date DATE NOT NULL,
  open_price INT DEFAULT NULL,
  high_price INT DEFAULT NULL,
  low_price INT DEFAULT NULL,
  close_price INT NOT NULL,
  volume BIGINT DEFAULT NULL,
  change_rate DECIMAL(5,2) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_price_date (stock_code, trade_date),
  CONSTRAINT fk_prices_stock FOREIGN KEY (stock_code) REFERENCES stocks(stock_code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='주식 일별 시세 정보';

-- 5. 주식 종목별 일일 뉴스 감성 집계 테이블
CREATE TABLE IF NOT EXISTS stock_daily_sentiment (
  daily_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stock_code VARCHAR(20) NOT NULL,
  target_date DATE NOT NULL,
  total_articles INT DEFAULT 0,
  positive_count INT DEFAULT 0,
  negative_count INT DEFAULT 0,
  neutral_count INT DEFAULT 0,
  avg_score DOUBLE DEFAULT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_daily_stock (stock_code, target_date),
  CONSTRAINT fk_daily_stock FOREIGN KEY (stock_code) REFERENCES stocks(stock_code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='주식 종목별 일일 뉴스 감성 집계';

-- 6. 수집 뉴스 기사 정보 테이블
CREATE TABLE IF NOT EXISTS news_articles (
  article_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  stock_code VARCHAR(10) NOT NULL,
  title VARCHAR(300) NOT NULL,
  content TEXT,
  url VARCHAR(500) NOT NULL UNIQUE,
  published_at VARCHAR(30) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  analysis_status VARCHAR(20) DEFAULT 'PENDING',
  is_stock_relevant TINYINT(1) NOT NULL DEFAULT 1,
  irrelevant_reason VARCHAR(100) DEFAULT NULL COMMENT '제외 사유(스포츠, 연예, 후원 등)',
  KEY idx_stock_relevant (stock_code, is_stock_relevant, published_at),
  CONSTRAINT fk_article_stock FOREIGN KEY (stock_code) REFERENCES stocks(stock_code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='수집 뉴스 기사 정보';

-- 7. 뉴스 기사별 감성 분석 결과 테이블
CREATE TABLE IF NOT EXISTS news_sentiments (
  sentiment_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  article_id BIGINT NOT NULL,
  label VARCHAR(20) NOT NULL,
  score DECIMAL(3,2) NOT NULL,
  summary TEXT,
  analyzed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sentiment_article FOREIGN KEY (article_id) REFERENCES news_articles(article_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='뉴스 기사별 감성 분석 결과';

-- 5대 핵심 분석 종목 초기 마스터 데이터
INSERT INTO stocks (stock_code, stock_name, market, market_type) VALUES
  ('005930', '삼성전자', 'KOSPI', 'KOSPI'),
  ('000660', 'SK하이닉스', 'KOSPI', 'KOSPI'),
  ('005380', '현대차', 'KOSPI', 'KOSPI'),
  ('035420', 'NAVER', 'KOSPI', 'KOSPI'),
  ('009150', '삼성전기', 'KOSPI', 'KOSPI')
ON DUPLICATE KEY UPDATE
  stock_name = VALUES(stock_name),
  market = VALUES(market),
  market_type = VALUES(market_type);
