package com.moodon.backend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

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
        String[] stockCodes = {
            "005930", // 삼성전자
            "000660", // SK하이닉스
            "005380", // 현대차
            "035420", // NAVER
            "009150"  // 삼성전기
        };

        for (String stockCode : stockCodes) {
            try {
                log.info("STOCK_SYNC_START code={}", stockCode);

                syncHistoricalPrices(stockCode, 30);

                // KIS API 호출 제한 방지를 위한 대기
                Thread.sleep(1000);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            } catch (Exception e) {
                log.error("STOCK_SYNC_FAILED code={}", stockCode, e);
            }
        }
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


        log.info("KIS 주가 조회 기간: {} ~ {}", startDateStr, endDateStr);

        log.info("KIS_RESPONSE code={} count={}",
            stockCode,
            dailyList == null ? 0 : dailyList.size());

        if (dailyList != null && !dailyList.isEmpty()) {
            log.info("KIS 첫 번째 데이터: {}", dailyList.get(0));
            log.info("KIS 마지막 데이터: {}", dailyList.get(dailyList.size() - 1));
        }

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

            if (dateStr == null || dateStr.isBlank()) {
                log.warn("STOCK_SKIPPED missing_date item={}", item);
                continue;
            }
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

                log.info(
                    "STOCK_SAVED date={} close={}",
                    dateStr,
                    price.getClosePrice()
                );


            } catch (Exception e) {
                log.error("STOCK_SAVE_ERROR date={}", dateStr, e);
            }
        }

        log.info("STOCK_SYNC_COMPLETE code={} days={} saved={}",
        stockCode, days, savedCount);
    }


    @Scheduled(cron = "0 10 16 * * MON-FRI", zone = "Asia/Seoul")
    public void scheduledStockPriceSync() {
        log.info("STOCK_DAILY_SYNC_START");

        String[] stockCodes = {
            "005930", // 삼성전자
            "000660", // SK하이닉스
            "005380", // 현대차
            "035420", // NAVER
            "009150"  // 삼성전기
        };

        for (String stockCode : stockCodes) {
            try {
                syncHistoricalPrices(stockCode, 7);
                log.info("STOCK_DAILY_SYNC_SUCCESS code={}", stockCode);
            } catch (Exception e) {
                log.error("STOCK_DAILY_SYNC_FAILED code={}", stockCode, e);
            }
        }

        log.info("STOCK_DAILY_SYNC_COMPLETE");
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