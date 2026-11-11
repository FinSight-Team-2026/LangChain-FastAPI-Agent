package com.moodon.backend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockPriceSyncService {

    private final StockPriceRepository stockPriceRepository;
    private final KisService kisService;

    @EventListener(ApplicationReadyEvent.class)
    public void initSyncOnStartup() {
        log.info("서버 기동 완료: 삼성전자(005930) 최근 30일 주가 동기화 시작...");
        syncHistoricalPrices("005930", 30);
    }

    @Transactional
    public void syncHistoricalPrices(String stockCode, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");
        String startDateStr = startDate.format(dtf);
        String endDateStr = endDate.format(dtf);

        @SuppressWarnings("rawtypes")
        List dailyList = kisService.fetchDailyPriceChart(stockCode, startDateStr, endDateStr);

        if (dailyList == null || dailyList.isEmpty()) {
            log.warn("{} 종목의 기간별 시세 데이터가 비어있습니다.", stockCode);
            return;
        }

        int savedCount = 0;
        for (Object obj : dailyList) {
            if (!(obj instanceof Map)) continue;
            @SuppressWarnings("unchecked")
            Map<String, Object> item = (Map<String, Object>) obj;

            String dateStr = getString(item, "stck_bsop_date");
            if (dateStr == null || dateStr.isBlank()) continue;

            LocalDate tradeDate = LocalDate.parse(dateStr, dtf);

            StockPrice price = stockPriceRepository.findByStockCodeAndTradeDate(stockCode, tradeDate)
                    .orElseGet(() -> {
                        StockPrice newPrice = new StockPrice();
                        newPrice.setStockCode(stockCode);
                        newPrice.setTradeDate(tradeDate);
                        return newPrice;
                    });

            try {
                price.setOpenPrice(parseIntSafe(item, "stck_oprc"));
                price.setHighPrice(parseIntSafe(item, "stck_hgpr"));
                price.setLowPrice(parseIntSafe(item, "stck_lwpr"));
                price.setClosePrice(parseIntSafe(item, "stck_clpr"));
                price.setVolume(parseLongSafe(item, "acml_vol"));
                price.setChangeRate(parseBigDecimalSafe(item, "fltt_rt"));

                stockPriceRepository.save(price);
                savedCount++;
            } catch (Exception e) {
                log.error("주가 데이터 파싱 실패 (일자: {}): {}", dateStr, e.getMessage());
            }
        }

        log.info("{} 종목 과거 {}일 데이터 총 {}건 DB 동기화 완료", stockCode, days, savedCount);
    }

    // --- Null 안전 파싱 유틸 메서드 ---
    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? String.valueOf(val).trim() : null;
    }

    private Integer parseIntSafe(Map<String, Object> map, String key) {
        String s = getString(map, key);
        if (s == null || s.isBlank()) return 0;
        return Integer.parseInt(s);
    }

    private Long parseLongSafe(Map<String, Object> map, String key) {
        String s = getString(map, key);
        if (s == null || s.isBlank()) return 0L;
        return Long.parseLong(s);
    }

    private BigDecimal parseBigDecimalSafe(Map<String, Object> map, String key) {
        String s = getString(map, key);
        if (s == null || s.isBlank()) return BigDecimal.ZERO;
        return new BigDecimal(s);
    }
}