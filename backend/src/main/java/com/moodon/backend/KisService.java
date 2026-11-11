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

    @Value("${kis.app-key:}")
    private String appKey;

    @Value("${kis.app-secret:}")
    private String appSecret;

    private String cachedToken = null;
    private LocalDateTime tokenExpiry = null;

    public KisService(@Value("${kis.base-url:https://openapi.koreainvestment.com:9443}") String baseUrl,
                      StockRepository stockRepository) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.stockRepository = stockRepository;
    }

    public synchronized String getAccessToken() {
        if (appKey == null || appKey.isBlank() || appSecret == null || appSecret.isBlank()) {
            return null;
        }

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
                this.tokenExpiry = LocalDateTime.now().plusHours(20);
                return this.cachedToken;
            }
        } catch (Exception e) {
            System.err.println("KIS 토큰 발급 실패: " + e.getMessage());
        }
        return null;
    }

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
            if (stock == null) {
                stock = new Stock();
                stock.setStockCode(stockCode);
                stock.setStockName(stockCode);
                stock.setCurrentPrice(70000);
                stock.setChangeRate(new BigDecimal("1.25"));
                stock.setVolume(15420000L);
                stock.setTradingValue(1085000L);
                stock.setUpdatedAt(LocalDateTime.now());
                return stockRepository.save(stock);
            }
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
                int currentPrice = Integer.parseInt(String.valueOf(output.get("stck_prpr")).replaceAll("[^0-9]", ""));
                BigDecimal changeRate = new BigDecimal(String.valueOf(output.get("prdy_ctrt")));
                long volume = Long.parseLong(String.valueOf(output.get("acml_vol")).replaceAll("[^0-9]", ""));
                long tradingValue = Long.parseLong(String.valueOf(output.get("acml_tr_pbmn")).replaceAll("[^0-9]", ""));

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
                double index = Double.parseDouble(String.valueOf(output.get("bstp_nmix_prpr")).replaceAll("[^0-9.]", ""));
                double changeRate = Double.parseDouble(String.valueOf(output.get("bstp_nmix_prdy_ctrt")));
                return Map.of("index", index, "changeRate", changeRate);
            }
        } catch (Exception e) {
            System.err.println("KOSPI 지수 조회 실패 (기본값 대체): " + e.getMessage());
        }

        return Map.of("index", 2540.30, "changeRate", -1.15);
    }
}
