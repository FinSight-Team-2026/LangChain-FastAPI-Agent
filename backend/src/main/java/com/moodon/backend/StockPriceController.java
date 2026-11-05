package com.moodon.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/kis")
@CrossOrigin(origins = "*")
public class StockPriceController {

    private final KisService kisService;
    private final StockRepository stockRepository;
    private final StockPriceRepository stockPriceRepository;

    public StockPriceController(KisService kisService,
                                StockRepository stockRepository,
                                StockPriceRepository stockPriceRepository) {
        this.kisService = kisService;
        this.stockRepository = stockRepository;
        this.stockPriceRepository = stockPriceRepository;
    }

    // 1. 전체 종목 리스트 조회
    @GetMapping("/stocks")
    public ResponseEntity<List<Stock>> getAllStocks() {
        return ResponseEntity.ok(stockRepository.findAll());
    }

    // 2. 단일 종목 시세 조회 (KIS 실시간 동기화 포함)
    @GetMapping("/stocks/{stockCode}")
    public ResponseEntity<Stock> getStockPrice(@PathVariable("stockCode") String stockCode) {
        Stock stock = kisService.fetchAndSyncCurrentPrice(stockCode);
        if (stock == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stock);
    }

    // 3. 종목별 최근 30일 시세 이력 조회
    @GetMapping("/stocks/{stockCode}/history")
    public ResponseEntity<List<StockPrice>> getStockHistory(@PathVariable("stockCode") String stockCode) {
        return ResponseEntity.ok(stockPriceRepository.findTop30ByStockCodeOrderByTradeDateDesc(stockCode));
    }
}
