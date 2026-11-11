
package com.moodon.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class KisService {

    private final RestClient restClient;
    private final StockRepository stockRepository;

    @Value("${kis.app-key}")
    private String appKey;

    @Value("${kis.app-secret}")
    private String appSecret;

    private String cachedToken;
    private LocalDateTime tokenExpiry;

    // KIS API 기본 설정
    private static final String KOSPI_CODE = "0001";
    private static final String INDEX_MARKET_CODE = "U";

    public KisService(
            @Value("${kis.base-url:https://openapi.koreainvestment.com:9443}")
            String baseUrl,
            StockRepository stockRepository
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();

        this.stockRepository = stockRepository;
    }

    // ==========================================
    // 1. KIS 접근 토큰 발급
    // ==========================================

    public synchronized String getAccessToken() {

        // 유효한 캐시 토큰이 있다면 재사용
        if (cachedToken != null
                && tokenExpiry != null
                && LocalDateTime.now().isBefore(tokenExpiry)) {

            return cachedToken;
        }

        try {

            Map<?, ?> response = restClient.post()
                    .uri("/oauth2/tokenP")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "grant_type", "client_credentials",
                            "appkey", appKey,
                            "appsecret", appSecret
                    ))
                    .retrieve()
                    .body(Map.class);

            if (response != null
                    && response.get("access_token") instanceof String) {

                cachedToken = (String) response.get("access_token");

                // KIS 접근 토큰 유효시간은 24시간.
                // 만료 직전 요청을 방지하기 위해 10분 일찍 갱신.
                tokenExpiry = LocalDateTime.now().plusHours(23).plusMinutes(50);

                System.out.println("[KIS] 접근 토큰 발급 성공");

                return cachedToken;
            }

            System.err.println("[KIS] 토큰 응답에 access_token이 없습니다.");

        } catch (Exception e) {

            System.err.println("[KIS] 토큰 발급 실패: " + e.getMessage());
        }

        // 만료된 토큰을 반환하지 않음
        cachedToken = null;
        tokenExpiry = null;

        return null;
    }


    // ==========================================
    // 2. 국내 주식 현재가 조회
    // ==========================================

    @Transactional
    public Stock fetchAndSyncCurrentPrice(String stockCode) {

        Stock stock = stockRepository.findById(stockCode)
                .orElse(null);

        // 최근 60초 이내 조회한 데이터가 있으면 재사용
        if (stock != null
                && stock.getCurrentPrice() != null
                && stock.getCurrentPrice() > 0
                && stock.getUpdatedAt() != null) {

            long secondsPassed = Duration.between(
                    stock.getUpdatedAt(),
                    LocalDateTime.now()
            ).getSeconds();

            if (secondsPassed >= 0 && secondsPassed < 60) {
                return stock;
            }
        }

        String token = getAccessToken();

        if (token == null) {
            System.err.println("[KIS] 현재가 조회 중단: 토큰 없음");
            return stock;
        }

        try {

            Map<?, ?> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/uapi/domestic-stock/v1/quotations/inquire-price")
                            .queryParam("FID_COND_MRKT_DIV_CODE", "J")
                            .queryParam("FID_INPUT_ISCD", stockCode)
                            .build())
                    .header("authorization", "Bearer " + token)
                    .header("appkey", appKey)
                    .header("appsecret", appSecret)
                    .header("tr_id", "FHKST01010100")
                    .header("custtype", "P")
                    .retrieve()
                    .body(Map.class);

            if (response == null || !"0".equals(response.get("rt_cd"))) {

                System.err.println(
                        "[KIS] 주식 현재가 조회 실패: "
                                + (response == null ? "응답 없음" : response.get("msg1"))
                );

                return stock;
            }

            Object outputObject = response.get("output");

            if (!(outputObject instanceof Map)) {
                return stock;
            }

            Map<?, ?> output = (Map<?, ?>) outputObject;

            Integer currentPrice = parseInteger(output.get("stck_prpr"));
            BigDecimal changeRate = parseBigDecimal(output.get("prdy_ctrt"));
            Long volume = parseLong(output.get("acml_vol"));
            Long tradingValue = parseLong(output.get("acml_tr_pbmn"));

            if (currentPrice == null || currentPrice <= 0
                    || changeRate == null
                    || volume == null
                    || tradingValue == null) {

                System.err.println("[KIS] 현재가 응답 데이터 형식 오류");
                return stock;
            }

            if (stock == null) {

                stock = new Stock();
                stock.setStockCode(stockCode);
                stock.setStockName(stockCode);
            }

            stock.setCurrentPrice(currentPrice);
            stock.setChangeRate(changeRate);
            stock.setVolume(volume);
            stock.setTradingValue(tradingValue);
            stock.setUpdatedAt(LocalDateTime.now());

            System.out.println(
                    "[KIS] " + stockCode
                            + " 현재가 조회 성공: " + currentPrice
            );

            return stockRepository.save(stock);

        } catch (Exception e) {

            System.err.println(
                    "[KIS] 주식 현재가 조회 실패 (" + stockCode + "): "
                            + e.getMessage()
            );

            return stock;
        }
    }


    // ==========================================
    // 3. 국내 주식 기간별 일봉 차트 조회
    // ==========================================

    @SuppressWarnings("rawtypes")
    public List fetchDailyPriceChart(
            String stockCode,
            String startDate,
            String endDate
    ) {

        String token = getAccessToken();

        if (token == null) {
            return Collections.emptyList();
        }

        try {

            Map<?, ?> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice")
                            .queryParam("FID_COND_MRKT_DIV_CODE", "J")
                            .queryParam("FID_INPUT_ISCD", stockCode)
                            .queryParam("FID_INPUT_DATE_1", startDate)
                            .queryParam("FID_INPUT_DATE_2", endDate)
                            .queryParam("FID_PERIOD_DIV_CODE", "D")
                            .queryParam("FID_ORG_ADJ_PRC", "0")
                            .build())
                    .header("authorization", "Bearer " + token)
                    .header("appkey", appKey)
                    .header("appsecret", appSecret)
                    .header("tr_id", "FHKST03010100")
                    .header("custtype", "P")
                    .retrieve()
                    .body(Map.class);

            if (response == null || !"0".equals(response.get("rt_cd"))) {

                System.err.println(
                        "[KIS] 기간별 차트 조회 실패: "
                                + (response == null ? "응답 없음" : response.get("msg1"))
                );

                return Collections.emptyList();
            }

            Object output2 = response.get("output2");

            if (output2 instanceof List) {
                return (List) output2;
            }

        } catch (Exception e) {

            System.err.println(
                    "[KIS] 기간별 시세 조회 실패 (" + stockCode + "): "
                            + e.getMessage()
            );
        }

        return Collections.emptyList();
    }


    // ==========================================
    // 4. 코스피 현재 지수 조회
    // ==========================================

    public Map<String, Object> fetchKospiIndex() {

        String token = getAccessToken();

        // 조회 실패 시 고정된 가짜 지수를 반환하지 않음
        if (token == null) {
            System.err.println("[KIS] 코스피 조회 실패: 토큰 없음");
            return createUnavailableIndex();
        }

        try {

            Map<?, ?> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/uapi/domestic-stock/v1/quotations/inquire-index-price")
                            .queryParam("FID_COND_MRKT_DIV_CODE", INDEX_MARKET_CODE)
                            .queryParam("FID_INPUT_ISCD", KOSPI_CODE)
                            .build())
                    .header("authorization", "Bearer " + token)
                    .header("appkey", appKey)
                    .header("appsecret", appSecret)
                    .header("tr_id", "FHPUP02100000")
                    .header("custtype", "P")
                    .retrieve()
                    .body(Map.class);

            // API 응답 검증
            if (response == null || !"0".equals(response.get("rt_cd"))) {

                System.err.println(
                        "[KIS] 코스피 지수 API 응답 오류: "
                                + (response == null
                                ? "응답 없음"
                                : response.get("msg_cd") + " / " + response.get("msg1"))
                );

                return createUnavailableIndex();
            }

            Object outputObject = response.get("output");

            if (!(outputObject instanceof Map)) {

                System.err.println("[KIS] 코스피 지수 output 데이터가 없습니다.");

                return createUnavailableIndex();
            }

            Map<?, ?> output = (Map<?, ?>) outputObject;

            // 실제 KIS API 응답 필드
            BigDecimal currentIndex = parseBigDecimal(
                    output.get("bstp_nmix_prpr")
            );

            BigDecimal changeRate = parseBigDecimal(
                    output.get("bstp_nmix_prdy_ctrt")
            );

            if (currentIndex == null || changeRate == null) {

                System.err.println("[KIS] 코스피 지수 숫자 데이터 변환 실패");

                return createUnavailableIndex();
            }

            // 실제 조회 결과 반환
            Map<String, Object> result = new LinkedHashMap<>();

            result.put("index", currentIndex);
            result.put("changeRate", changeRate);
            result.put("available", true);

            System.out.println(
                    "[KIS] 코스피 조회 성공 | 지수: "
                            + currentIndex
                            + " | 등락률: "
                            + changeRate + "%"
            );

            return result;

        } catch (Exception e) {

            System.err.println(
                    "[KIS] 코스피 지수 조회 실패: " + e.getMessage()
            );

            return createUnavailableIndex();
        }
    }


    // ==========================================
    // 5. 코스피 조회 실패 시 안전한 응답
    // ==========================================

    private Map<String, Object> createUnavailableIndex() {

        Map<String, Object> result = new LinkedHashMap<>();

        // 임의의 고정 지수를 제공하지 않음
        result.put("index", null);
        result.put("changeRate", null);
        result.put("available", false);

        return result;
    }


    // ==========================================
    // 6. 숫자 변환 유틸리티
    // ==========================================

    private Integer parseInteger(Object value) {

        try {

            if (value == null) {
                return null;
            }

            return Integer.parseInt(
                    value.toString().replace(",", "").trim()
            );

        } catch (NumberFormatException e) {

            return null;
        }
    }


    private Long parseLong(Object value) {

        try {

            if (value == null) {
                return null;
            }

            return Long.parseLong(
                    value.toString().replace(",", "").trim()
            );

        } catch (NumberFormatException e) {

            return null;
        }
    }


    private BigDecimal parseBigDecimal(Object value) {

        try {

            if (value == null) {
                return null;
            }

            String number = value.toString()
                    .replace(",", "")
                    .trim();

            if (number.isEmpty()) {
                return null;
            }

            return new BigDecimal(number);

        } catch (NumberFormatException e) {

            return null;
        }
    }
}
