package com.moodon.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kis")
@CrossOrigin(origins = "*")
public class StockSearchController {

    private final StockRepository stockRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public StockSearchController(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @GetMapping("/stocks")
    public ResponseEntity<List<Stock>> searchStocks(@RequestParam("keyword") String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        String term = keyword.trim();
        List<Stock> result = stockRepository.findByStockNameContainingIgnoreCaseOrStockCodeContaining(term, term);

        // 검색된 모든 종목 중 가격이 0원인 항목은 병렬로 실시간 시세를 채워서 반환
        result.parallelStream().forEach(stock -> {
            if (stock.getCurrentPrice() == null || stock.getCurrentPrice() == 0) {
                try {
                    String url = "https://m.stock.naver.com/api/stock/" + stock.getStockCode() + "/basic";
                    Map response = restTemplate.getForObject(url, Map.class);
                    if (response != null && response.get("closePrice") != null) {
                        int price = Integer.parseInt(response.get("closePrice").toString().replace(",", ""));
                        BigDecimal changeRate = new BigDecimal(response.get("fluctuationsRatio").toString());
                        stock.setCurrentPrice(price);
                        stock.setChangeRate(changeRate);
                    }
                } catch (Exception ignored) {
                }
            }
        });

        return ResponseEntity.ok(result);
    }
}
