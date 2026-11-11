
package com.moodon.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class KospiService {

    private final RestClient restClient;
    private final KisService kisService;

    @Value("${kis.app-key:}")
    private String appKey;

    @Value("${kis.app-secret:}")
    private String appSecret;

    private Map<String, Object> cachedKospi;
    private LocalDateTime cacheExpiry;

    public KospiService(
            @Value("${kis.base-url:https://openapi.koreainvestment.com:9443}")
            String baseUrl,
            KisService kisService) {

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();

        this.kisService = kisService;
    }

    public synchronized Map<String, Object> getKospi() {

        // 60초 캐시
        if (cachedKospi != null
                && cacheExpiry != null
                && LocalDateTime.now().isBefore(cacheExpiry)) {
            return cachedKospi;
        }

        String token = kisService.getAccessToken();

        if (token == null) {
            throw new IllegalStateException("KIS 토큰 발급 실패");
        }

        Map<?, ?> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/uapi/domestic-stock/v1/quotations/inquire-index-price")
                        .queryParam("FID_COND_MRKT_DIV_CODE", "U")
                        .queryParam("FID_INPUT_ISCD", "0001")
                        .build())
                .header("authorization", "Bearer " + token)
                .header("appkey", appKey)
                .header("appsecret", appSecret)
                .header("tr_id", "FHPUP02100000")
                .retrieve()
                .body(Map.class);

        if (response == null
                || !"0".equals(String.valueOf(response.get("rt_cd")))
                || !(response.get("output") instanceof Map)) {
            throw new IllegalStateException(
                    "KOSPI API 응답 오류: " + response);
        }

        Map<?, ?> output = (Map<?, ?>) response.get("output");

        BigDecimal index = new BigDecimal(
                output.get("bstp_nmix_prpr").toString());

        BigDecimal change = new BigDecimal(
                output.get("bstp_nmix_prdy_vrss").toString());

        BigDecimal changeRate = new BigDecimal(
                output.get("bstp_nmix_prdy_ctrt").toString());

        // KIS 전일 대비 부호 코드
        String sign = String.valueOf(output.get("prdy_vrss_sign"));

        if ("4".equals(sign) || "5".equals(sign)) {
            change = change.abs().negate();
            changeRate = changeRate.abs().negate();
        } else if ("1".equals(sign) || "2".equals(sign)) {
            change = change.abs();
            changeRate = changeRate.abs();
        }

        cachedKospi = Map.of(
                "market", "KOSPI",
                "index", index,
                "change", change,
                "changeRate", changeRate,
                "updatedAt", LocalDateTime.now().toString()
        );

        cacheExpiry = LocalDateTime.now().plusSeconds(60);

        return cachedKospi;
    }

    public synchronized Map<String, Object> getKospiDaily() {

        String token = kisService.getAccessToken();

        if (token == null || token.isBlank()) {
            throw new IllegalStateException("KIS 토큰 발급 실패");
        }

        String today = java.time.LocalDate.now()
                .format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);

        Map<?, ?> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/uapi/domestic-stock/v1/quotations/inquire-index-daily-price")
                        .queryParam("FID_PERIOD_DIV_CODE", "D")
                        .queryParam("FID_COND_MRKT_DIV_CODE", "U")
                        .queryParam("FID_INPUT_ISCD", "0001")
                        .queryParam("FID_INPUT_DATE_1", today)
                        .build())
                .header("authorization", "Bearer " + token)
                .header("appkey", appKey)
                .header("appsecret", appSecret)
                .header("tr_id", "FHPUP02120000")
                .retrieve()
                .body(Map.class);

        if (response == null
                || !"0".equals(String.valueOf(response.get("rt_cd")))
                || !(response.get("output2") instanceof java.util.List<?>)) {
            throw new IllegalStateException(
                    "KOSPI 일별 지수 조회 오류: " + response);
        }

        java.util.List<?> rawData =
                (java.util.List<?>) response.get("output2");

        java.util.List<Map<String, Object>> dailyData =
                new java.util.ArrayList<>();

        for (Object item : rawData) {

            if (!(item instanceof Map<?, ?> row)) {
                continue;
            }

            String date = String.valueOf(
                    row.get("stck_bsop_date"));

            String indexValue = String.valueOf(
                    row.get("bstp_nmix_prpr"));

            if (date.isBlank() || date.equals("null")
                    || indexValue.isBlank()
                    || indexValue.equals("null")) {
                continue;
            }

            dailyData.add(Map.of(
                    "date", date,
                    "index", new BigDecimal(indexValue)
            ));
        }

        dailyData.sort(
                java.util.Comparator.comparing(
                        row -> (String) row.get("date"))
        );

        return Map.of(
                "market", "KOSPI",
                "count", dailyData.size(),
                "daily", dailyData
        );
    }

}
