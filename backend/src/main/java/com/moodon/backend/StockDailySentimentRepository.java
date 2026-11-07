package com.moodon.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StockDailySentimentRepository extends JpaRepository<StockDailySentiment, Long> {
    // 최근 날짜 순으로 해당 종목의 일별 감성 추이 조회
    List<StockDailySentiment> findTop30ByStockCodeOrderByTargetDateDesc(String stockCode);

    // 가장 최근 1일 감성 지표 조회 (온도계 게이지용)
    Optional<StockDailySentiment> findFirstByStockCodeOrderByTargetDateDesc(String stockCode);
}