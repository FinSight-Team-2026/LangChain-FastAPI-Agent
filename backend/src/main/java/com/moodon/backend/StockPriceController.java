package com.moodon.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "*")
public class StockPriceController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/{stockCode}/price")
    public ResponseEntity<?> getStockPrice(@PathVariable("stockCode") String stockCode) {
        try {
            String url = "https://m.stock.naver.com/api/stock/" + stockCode + "/basic";
            Map response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "시세 조회 실패: " + e.getMessage()));
        }
    }
}
