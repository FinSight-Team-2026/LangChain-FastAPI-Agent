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
}
