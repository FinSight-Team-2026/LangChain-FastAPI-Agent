package com.moodon.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {
    
    // 1. StockPriceSyncService에서 중복 적재 방지용으로 사용하는 메서드
    Optional<StockPrice> findByStockCodeAndTradeDate(String stockCode, LocalDate tradeDate);

    // 2. StockPriceController(38번 줄)에서 30일치 시세 가져올 때 호출하는 메서드
    List<StockPrice> findTop30ByStockCodeOrderByTradeDateDesc(String stockCode);

    // 3. 차트용 오름차순 정렬 조회 (필요 시 사용)
    List<StockPrice> findByStockCodeOrderByTradeDateAsc(String stockCode);
}