package com.moodon.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks") // 또는 기존에 설정된 공통 Base Path
@CrossOrigin(origins = "*")
public class StockPriceController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final StockPriceRepository stockPriceRepository;

    // Repository 주입
    public StockPriceController(StockPriceRepository stockPriceRepository) {
        this.stockPriceRepository = stockPriceRepository;
    }

    // 기존 단건 시세
    @GetMapping("/{stockCode}/price")
    public ResponseEntity<?> getStockPrice(@PathVariable("stockCode") String stockCode) {
        try {
            String url = "https://m.stock.naver.com/api/stock/" + stockCode + "/basic";
            Map response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // [추가] 최근 일별 주가 이력 조회 (DB 저장 데이터 기준)
    @GetMapping("/{stockCode}/prices/daily")
    public ResponseEntity<List<StockPrice>> getDailyPrices(@PathVariable("stockCode") String stockCode) {
        List<StockPrice> prices = stockPriceRepository.findTop30ByStockCodeOrderByTradeDateDesc(stockCode);
        return ResponseEntity.ok(prices);
    }
}