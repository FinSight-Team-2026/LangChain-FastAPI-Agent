
package com.moodon.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/market")
public class MarketComparisonController {

    private final StockPriceRepository stockPriceRepository;
    private final KospiService kospiService;

    public MarketComparisonController(
            StockPriceRepository stockPriceRepository,
            KospiService kospiService) {
        this.stockPriceRepository = stockPriceRepository;
        this.kospiService = kospiService;
    }

    @GetMapping("/compare/{stockCode}")
    public ResponseEntity<?> compare(
            @PathVariable String stockCode) {

        try {
            // 1. DB에서 종목 일별 주가 조회
            List<StockPrice> stockPrices =
                    stockPriceRepository
                            .findTop30ByStockCodeOrderByTradeDateDesc(
                                    stockCode);

            // 2. KIS에서 KOSPI 일별 지수 조회
            Map<String, Object> kospiResult =
                    kospiService.getKospiDaily();

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> kospiDaily =
                    (List<Map<String, Object>>)
                            kospiResult.get("daily");

            // 3. KOSPI 날짜별 지수 저장
            Map<String, BigDecimal> kospiByDate =
                    new HashMap<>();

            for (Map<String, Object> row : kospiDaily) {
                kospiByDate.put(
                        row.get("date").toString(),
                        new BigDecimal(
                                row.get("index").toString())
                );
            }

            // 4. 공통 거래일만 추출
            List<Map<String, Object>> matched =
                    new ArrayList<>();

            for (StockPrice stock : stockPrices) {

                String date = stock.getTradeDate()
                        .toString()
                        .replace("-", "");

                BigDecimal kospi = kospiByDate.get(date);

                if (kospi == null ||
                        stock.getClosePrice() == null) {
                    continue;
                }

                matched.add(Map.of(
                        "date", date,
                        "stockPrice", stock.getClosePrice(),
                        "kospiIndex", kospi
                ));
            }

            // 5. 날짜 오름차순 정렬
            matched.sort(Comparator.comparing(
                    row -> row.get("date").toString()
            ));

            if (matched.size() < 2) {
                return ResponseEntity.badRequest().body(
                        Map.of("error",
                                "비교 가능한 공통 거래일이 2일 미만입니다.")
                );
            }

            // 6. 공통 구간의 시작/마지막 데이터
            Map<String, Object> first = matched.get(0);
            Map<String, Object> last =
                    matched.get(matched.size() - 1);

            BigDecimal stockReturn = calculateReturn(
                    first.get("stockPrice"),
                    last.get("stockPrice")
            );

            BigDecimal kospiReturn = calculateReturn(
                    first.get("kospiIndex"),
                    last.get("kospiIndex")
            );

            BigDecimal relativeReturn =
                    stockReturn.subtract(kospiReturn);

            // 7. 비교 결과 반환
            Map<String, Object> result = new LinkedHashMap<>();

            result.put("stockCode", stockCode);
            result.put("startDate", first.get("date"));
            result.put("endDate", last.get("date"));
            result.put("matchedDays", matched.size());
            result.put("stockReturn", stockReturn);
            result.put("kospiReturn", kospiReturn);
            result.put("relativeReturn", relativeReturn);
            result.put("daily", matched);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "시장 비교 실패",
                            "message", e.getMessage()
                    ));
        }
    }

    private BigDecimal calculateReturn(
            Object startValue, Object endValue) {

        BigDecimal start =
                new BigDecimal(startValue.toString());

        BigDecimal end =
                new BigDecimal(endValue.toString());

        if (start.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException(
                    "기준값이 0이어서 수익률 계산 불가");
        }

        return end.subtract(start)
                .divide(start, 8, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
