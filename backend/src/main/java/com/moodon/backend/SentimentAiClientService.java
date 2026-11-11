package com.moodon.backend;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Service
public class SentimentAiClientService {

    private final RestClient restClient;
    private static final String FASTAPI_BASE_URL = "http://localhost:8000";

    public SentimentAiClientService() {
        this.restClient = RestClient.builder()
                .baseUrl(FASTAPI_BASE_URL)
                .build();
    }

    public AiSentimentResponse fetchSentimentAnalysis(String stockCode) {
        try {
            return restClient.get()
                    .uri("/api/ai/sentiment/{code}", stockCode)
                    .retrieve()
                    .body(AiSentimentResponse.class);
        } catch (Exception e) {
            log.warn("FastAPI 감성 분석 서버 통신 대기 (종목코드: {}), Fallback 데이터를 적용합니다. 사유: {}", stockCode, e.getMessage());
            return buildFallbackResponse(stockCode);
        }
    }

    private AiSentimentResponse buildFallbackResponse(String stockCode) {
        return AiSentimentResponse.builder()
                .stockCode(stockCode)
                .score(78)
                .status("긍정")
                .positiveRatio(74)
                .neutralRatio(18)
                .negativeRatio(8)
                .newsList(List.of(
                        AiNewsItem.builder()
                                .id("fb-1")
                                .title("핵심 사업 부문 글로벌 유료 이용자 및 외형 성장세 지속")
                                .source("네이버 증권")
                                .timeAgo("1시간 전")
                                .sentiment("positive")
                                .sentimentLabel("호재")
                                .summary("주력 사업부문의 글로벌 진출 및 안정적인 수익화 모델 구축으로 매출 신장이 전망됩니다.")
                                .build(),
                        AiNewsItem.builder()
                                .id("fb-2")
                                .title("기업용 AI 플랫폼 및 클라우드 B2B 솔루션 수주 확대")
                                .source("매일경제")
                                .timeAgo("3시간 전")
                                .sentiment("positive")
                                .sentimentLabel("호재")
                                .summary("산업 전반의 디지털 전환 수요 증가로 엔터프라이즈 AI 서비스 매출 기여도가 본격화되고 있습니다.")
                                .build(),
                        AiNewsItem.builder()
                                .id("fb-3")
                                .title("물류 효율화 및 풀필먼트 수수료 안착에 따른 마진율 개선")
                                .source("연합인포맥스")
                                .timeAgo("5시간 전")
                                .sentiment("neutral")
                                .sentimentLabel("이슈")
                                .summary("물류 경쟁 비용 절감과 정산 체계 안정화로 커머스 부문 수익성이 개선 궤도에 올랐습니다.")
                                .build()
                ))
                .build();
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiSentimentResponse {
        private String stockCode;
        private Integer score;
        private String status;
        private Integer positiveRatio;
        private Integer neutralRatio;
        private Integer negativeRatio;
        private List<AiNewsItem> newsList;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiNewsItem {
        private String id;
        private String title;
        private String source;
        private String timeAgo;
        private String sentiment;
        private String sentimentLabel;
        private String summary;
    }
}