INSERT INTO stocks (stock_code, stock_name, market, market_type) VALUES
('005930', '삼성전자', 'KOSPI', 'KOSPI'),
('000660', 'SK하이닉스', 'KOSPI', 'KOSPI'),
('196170', '알테오젠', 'KOSDAQ', 'KOSDAQ'),
('012450', '한화에어로스페이스', 'KOSPI', 'KOSPI'),
('003230', '삼양식품', 'KOSPI', 'KOSPI'),
('005380', '현대차', 'KOSPI', 'KOSPI'),
('373220', 'LG에너지솔루션', 'KOSPI', 'KOSPI'),
('035420', 'NAVER', 'KOSPI', 'KOSPI'),
('247540', '에코프로비엠', 'KOSDAQ', 'KOSDAQ'),
('068270', '셀트리온', 'KOSPI', 'KOSPI'),
('035720', '카카오', 'KOSPI', 'KOSPI'),
('267260', 'HD현대일렉트릭', 'KOSPI', 'KOSPI'),
('259960', '크래프톤', 'KOSPI', 'KOSPI'),
('000270', '기아', 'KOSPI', 'KOSPI'),
('005490', 'POSCO홀딩스', 'KOSPI', 'KOSPI')
ON DUPLICATE KEY UPDATE stock_name = VALUES(stock_name), market = VALUES(market), market_type = VALUES(market_type);