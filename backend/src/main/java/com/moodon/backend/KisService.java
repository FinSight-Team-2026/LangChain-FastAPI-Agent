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

    private String cachedToken = null;
    private LocalDateTime tokenExpiry = null;

    public KisService(@Value("${kis.base-url:https://openapi.koreainvestment.com:9443}") String baseUrl,
                      StockRepository stockRepository) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.stockRepository = stockRepository;
    }

    // 1. KIS OAuth 토큰 발급 (캐싱 포함)
    public synchronized String getAccessToken() {
        if (cachedToken != null && tokenExpiry != null && LocalDateTime.now().isBefore(tokenExpiry)) {
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

            if (response != null && response.containsKey("access_token")) {
                this.cachedToken = (String) response.get("access_token");
                // 유효기간 여유를 두고 20시간 캐싱
                this.tokenExpiry = LocalDateTime.now().plusHours(20);
                return this.cachedToken;
            }
        } catch (Exception e) {
            System.err.println("KIS 토큰 발급 실패: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    // 2. 실시간 시세 조회 및 stocks 테이블 DB 동기화 (TTL 60초 캐싱 적용)
    @Transactional
    public Stock fetchAndSyncCurrentPrice(String stockCode) {
        Stock stock = stockRepository.findById(stockCode).orElse(null);

        if (stock != null && stock.getCurrentPrice() != null && stock.getCurrentPrice() > 0 && stock.getUpdatedAt() != null) {
            long secondsPassed = Duration.between(stock.getUpdatedAt(), LocalDateTime.now()).getSeconds();
            if (secondsPassed < 60) {
                return stock;
            }
        }

        String token = getAccessToken();
        if (token == null) {
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
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("output")) {
                Map<?, ?> output = (Map<?, ?>) response.get("output");
                int currentPrice = Integer.parseInt((String) output.get("stck_prpr"));
                BigDecimal changeRate = new BigDecimal((String) output.get("prdy_ctrt"));
                long volume = Long.parseLong((String) output.get("acml_vol"));
                long tradingValue = Long.parseLong((String) output.get("acml_tr_pbmn"));

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

                return stockRepository.save(stock);
            }
        } catch (Exception e) {
            System.err.println("KIS 시세 조회 실패: " + e.getMessage());
        }

        return stock;
    }

    // 3. 국내주식 기간별 시세 조회
    @SuppressWarnings("rawtypes")
    public List fetchDailyPriceChart(String stockCode, String startDate, String endDate) {
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
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("output2")) {
                Object output2 = response.get("output2");
                if (output2 instanceof List) {
                    return (List) output2;
                }
            }
        } catch (Exception e) {
            System.err.println("KIS 기간별 시세 조회 실패: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    // 4. KOSPI 실시간 업종 지수 및 등락률 조회
    public Map<String, Object> fetchKospiIndex() {
        String token = getAccessToken();
        if (token == null) {
            return Map.of("index", 2540.30, "changeRate", -1.15);
        }

        try {
            Map<?, ?> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/uapi/domestic-stock/v1/quotations/inquire-index-price")
                            .queryParam("FID_COND_MRKT_DIV_CODE", "U")
                            .queryParam("FID_INPUT_ISCD", "0001")
                            .build())
                    .header("authorization", "Bearer " + token)
                    .header("appkey", appKey)
                    .header("appsecret", appSecret)
                    .header("tr_id", "FHKUP03500100")
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("output")) {
                Map<?, ?> output = (Map<?, ?>) response.get("output");
                double index = Double.parseDouble(String.valueOf(output.get("bstp_nmix_prpr")));
                double changeRate = Double.parseDouble(String.valueOf(output.get("bstp_nmix_prdy_ctrt")));
                return Map.of("index", index, "changeRate", changeRate);
            }
        } catch (Exception e) {
            System.err.println("KOSPI 지수 조회 실패 (기본값 대체): " + e.getMessage());
        }

        return Map.of("index", 2540.30, "changeRate", -1.15);
    }
}