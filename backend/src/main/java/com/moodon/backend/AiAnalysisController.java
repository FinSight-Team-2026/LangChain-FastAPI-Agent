package com.moodon.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiAnalysisController {

    private final RestClient restClient;

    public AiAnalysisController(@Value("${fastapi.base-url:http://localhost:8001}") String fastApiBaseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(fastApiBaseUrl)
                .build();
    }

    // 1. AI 서버 상태 확인
    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        try {
            String response = restClient.get()
                    .uri("/api/ai/health")
                    .retrieve()
                    .body(String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "FastAPI 서버 연결 실패: " + e.getMessage()));
        }
    }

    // 2. 종목별 AI 분석 요청 (비동기 트리거 -> 202 Accepted & job_id 반환)
    @PostMapping("/analyze/{stockCode}")
    public ResponseEntity<?> requestAnalysis(@PathVariable("stockCode") String stockCode) {
        try {
            Map<?, ?> response = restClient.post()
                    .uri("/api/ai/analyze/{stock_code}", stockCode)
                    .retrieve()
                    .body(Map.class);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "분석 요청 실패: " + e.getMessage()));
        }
    }

    // 3. 분석 작업 상태 확인
    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable("jobId") String jobId) {
        try {
            Map<?, ?> response = restClient.get()
                    .uri("/api/ai/jobs/{job_id}", jobId)
                    .retrieve()
                    .body(Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "작업 상태 조회 실패: " + e.getMessage()));
        }
    }
    
    // 4. 종목별 다음 거래일 주가 방향 예측
    @GetMapping("/prediction/{stockCode}")
    public ResponseEntity<?> getStockPrediction(
            @PathVariable("stockCode") String stockCode,
            @RequestParam("as_of_date") String asOfDate) {

        try {
            Map<?, ?> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/ai/prediction/{stockCode}")
                            .queryParam("as_of_date", asOfDate)
                            .build(stockCode))
                    .retrieve()
                    .body(Map.class);

            return ResponseEntity.ok(response);

                } catch (Exception e) {
            var mockNews = java.util.List.of(
                    java.util.Map.of(
                            "id", 1,
                            "title", "글로벌 신규 수주 확대 및 4분기 실적 개선 모멘텀",
                            "press", "연합인포맥스",
                            "source", "연합인포맥스",
                            "publishedAt", "2026-11-11T13:20:00Z",
                            "timeAgo", "1시간 전",
                            "sentiment", "positive",
                            "sentimentLabel", "호재",
                            "summary", "주력 사업부문의 글로벌 공급망 확대에 힘입어 분기 실적 턴어라운드가 기대됩니다."
                    ),
                    java.util.Map.of(
                            "id", 2,
                            "title", "적극적 주주가치 제고 정책 및 기관 순매수 유입",
                            "press", "한국경제",
                            "source", "한국경제",
                            "publishedAt", "2026-11-11T11:40:00Z",
                            "timeAgo", "3시간 전",
                            "sentiment", "positive",
                            "sentimentLabel", "호재",
                            "summary", "자사주 소각 및 배당 확대 기조가 강화되며 기관 수급의 하방 지지력이 견고해지고 있습니다."
                    ),
                    java.util.Map.of(
                            "id", 3,
                            "title", "매크로 지수 변동성에 따른 외국인 수급 숨고르기",
                            "press", "매일경제",
                            "source", "매일경제",
                            "publishedAt", "2026-11-11T09:15:00Z",
                            "timeAgo", "5시간 전",
                            "sentiment", "neutral",
                            "sentimentLabel", "이슈",
                            "summary", "환율 변동성 확대에 따른 관망세로 외국인 순매수가 일시적 숨고르기 양상을 보이고 있습니다."
                    )
            );
            return ResponseEntity.ok(java.util.Map.of(
                    "stockCode", stockCode,
                    "news", mockNews,
                    "items", mockNews
            ));
        }
    }
            // 5. 종목별 최신 뉴스 3줄 요약 조회
    @GetMapping("/news-summary/{stockCode}")
    public ResponseEntity<?> getNewsSummary(
            @PathVariable String stockCode,
            @RequestParam(defaultValue = "5") int limit) {

        if (limit < 1 || limit > 20) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "limit은 1~20 사이여야 합니다."));
        }

        try {
            var response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/ai/news-summary/{stockCode}")
                            .queryParam("limit", limit)
                            .build(stockCode))
                    .retrieve()
                    .body(java.util.Map.class);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            var mockNews = java.util.List.of(
                    java.util.Map.of(
                            "id", 1,
                            "title", "[대체] 글로벌 수주 및 실적 모멘텀",
                            "press", "연합인포맥스",
                            "publishedAt", "2026-11-11T13:20:00Z",
                            "sentiment", "positive",
                            "summary", "AI 응답 지연으로 인한 임시 요약 데이터입니다."
                    )
            );
            return ResponseEntity.ok(java.util.Map.of(
                    "stockCode", stockCode,
                    "news", mockNews,
                    "items", mockNews
            ));
        }
    }
}
