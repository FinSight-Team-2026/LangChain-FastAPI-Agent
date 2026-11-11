package com.moodon.backend;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "*")
public class SentimentController {

    private final StockDailySentimentRepository dailySentimentRepo;
    private final NewsSentimentRepository newsSentimentRepo;

    public SentimentController(StockDailySentimentRepository dailySentimentRepo,
                               NewsSentimentRepository newsSentimentRepo) {
        this.dailySentimentRepo = dailySentimentRepo;
        this.newsSentimentRepo = newsSentimentRepo;
    }

    // 1. 일별 감성 추이 (최근 30일치)
    @GetMapping("/{stockCode}/sentiment/daily")
    public ResponseEntity<List<StockDailySentiment>> getDailySentiments(@PathVariable("stockCode") String stockCode) {
        return ResponseEntity.ok(dailySentimentRepo.findTop30ByStockCodeOrderByTargetDateDesc(stockCode));
    }

    // 2. 당일/최신 감성 온도계 지표
    @GetMapping("/{stockCode}/sentiment/latest")
    public ResponseEntity<StockDailySentiment> getLatestSentiment(@PathVariable("stockCode") String stockCode) {
        return dailySentimentRepo.findFirstByStockCodeOrderByTargetDateDesc(stockCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // 3. 분석 완료된 뉴스 피드 및 Gemini 3줄 요약 목록 (analysis_status='DONE' & is_stock_relevant=1)
    @GetMapping("/{stockCode}/news/summaries")
    public ResponseEntity<List<NewsSentimentProjection>> getNewsSummaries(
            @PathVariable("stockCode") String stockCode,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(newsSentimentRepo.findAnalyzedNews(stockCode, PageRequest.of(0, limit)));
    }
}