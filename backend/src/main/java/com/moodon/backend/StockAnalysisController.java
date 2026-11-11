package com.moodon.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StockAnalysisController {

    private final KospiService kospiService;
    private final KisService kisService;

    // 1. 메인 대시보드 API (상단 5개 퀵 셀렉터 카드용)
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDto> getDashboard() {
        // 실시간 KOSPI 지수 조회
        Map<String, Object> kospiData = kospiService.getKospi();
        double kospiIndex = ((Number) kospiData.get("index")).doubleValue();
        double kospiChange = ((Number) kospiData.get("changeRate")).doubleValue();

        String marketMood = kospiChange > 0.5 ? "KOSPI 상승세 지속 중" :
                (kospiChange < -0.5 ? "KOSPI 조정 및 관망세" : "KOSPI 보합권 횡보");

        List<DashboardResponseDto.StockSummary> stockSummaries = new ArrayList<>();

        for (StockTarget target : StockTarget.values()) {
            Stock syncedStock = kisService.fetchAndSyncCurrentPrice(target.getCode());

            stockSummaries.add(DashboardResponseDto.StockSummary.builder()
                    .stockCode(target.getCode())
                    .stockName(target.getName())
                    .currentPrice(syncedStock != null && syncedStock.getCurrentPrice() != null ? syncedStock.getCurrentPrice() : 0)
                    .changeRate(syncedStock != null && syncedStock.getChangeRate() != null ? syncedStock.getChangeRate().doubleValue() : 0.0)
                    .sentimentScore(75)
                    .build());
        }

        DashboardResponseDto response = DashboardResponseDto.builder()
                .kospiSummary(DashboardResponseDto.MarketSummary.builder()
                        .currentIndex(kospiIndex)
                        .changeRate(kospiChange)
                        .marketMoodBrief(marketMood)
                        .build())
                .stocks(stockSummaries)
                .build();

        return ResponseEntity.ok(response);
    }

    // 2. 종목 상세 전체 뷰 API (하단 6개 카드 전체 바인딩용)
    @GetMapping("/stocks/{code}/detail")
    public ResponseEntity<StockDataResponseDto> getStockDetail(@PathVariable String code) {
        String stockName = "선택 종목";
        for (StockTarget target : StockTarget.values()) {
            if (target.getCode().equals(code)) {
                stockName = target.getName();
                break;
            }
        }

        // KIS 실시간 시세 동기화
        Stock stock = kisService.fetchAndSyncCurrentPrice(code);
        int currentPrice = (stock != null && stock.getCurrentPrice() != null) ? stock.getCurrentPrice() : 0;
        double changeRate = (stock != null && stock.getChangeRate() != null) ? stock.getChangeRate().doubleValue() : 0.0;
        long volume = (stock != null && stock.getVolume() != null) ? stock.getVolume() : 0L;
        long tradingValue = (stock != null && stock.getTradingValue() != null) ? stock.getTradingValue() : 0L;

        // KIS 실시간 KOSPI 지수 조회
        Map<String, Object> kospiData = kospiService.getKospi();
        double kospiIndex = ((Number) kospiData.get("index")).doubleValue();
        double kospiChangePercent = ((Number) kospiData.get("changeRate")).doubleValue();

        // KIS 1년 일봉 데이터 수집 및 이동평균선(20일, 60일) 계산
        String endDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String startDate = LocalDate.now().minusYears(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        List rawCandles = kisService.fetchDailyPriceChart(code, startDate, endDate);
        List<StockDataResponseDto.YearlyCandlePointDto> yearlyChartData = buildYearlyChartData(rawCandles);

        // 20일선 추출
        double latestMa20 = yearlyChartData.isEmpty() ? currentPrice :
                yearlyChartData.get(yearlyChartData.size() - 1).getMa20();

        // KOSPI 상대 수익률 기반 패닉 디펜스 및 기술적 결론 계산
        StockDataResponseDto.PanicDefenseInfoDto panicDefense = buildPanicDefense(changeRate, kospiChangePercent, stockName);
        StockDataResponseDto.FinalConclusionDto finalConclusion = buildFinalConclusion(currentPrice, changeRate, latestMa20);

        StockDataResponseDto response = StockDataResponseDto.builder()
                .id(code)
                .name(stockName)
                .code(code)
                .category("KOSPI 대형주")
                .quote(StockDataResponseDto.StockQuoteDto.builder()
                        .code(code)
                        .name(stockName)
                        .englishName(code)
                        .currentPrice(currentPrice)
                        .changePrice((int) Math.round(currentPrice * (changeRate / 100.0)))
                        .changeRate(changeRate)
                        .high52w((int) (currentPrice * 1.15))
                        .low52w((int) (currentPrice * 0.78))
                        .volume(volume)
                        .tradingValue(tradingValue)
                        .marketCap(150L)
                        .openPrice(currentPrice)
                        .highPrice((int) (currentPrice * 1.02))
                        .lowPrice((int) (currentPrice * 0.98))
                        .prevClosePrice((int) (currentPrice / (1 + (changeRate / 100.0))))
                        .foreignOwnership(32.5)
                        .per(11.2)
                        .pbr(1.05)
                        .build())
                .sentimentScore(78)
                .sentimentStatus("긍정")
                .sentimentBreakdown(StockDataResponseDto.SentimentBreakdownDto.builder()
                        .positive(74)
                        .neutral(18)
                        .negative(8)
                        .build())
                .metrics7d(List.of(
                        StockDataResponseDto.DailyMetricDto.builder().day("11.03").fullDate("2026.11.03").sentimentScore(72).stockPrice((int)(currentPrice * 0.96)).kospiIndex(2550.2).build(),
                        StockDataResponseDto.DailyMetricDto.builder().day("11.04").fullDate("2026.11.04").sentimentScore(68).stockPrice((int)(currentPrice * 0.97)).kospiIndex(2542.1).build(),
                        StockDataResponseDto.DailyMetricDto.builder().day("11.05").fullDate("2026.11.05").sentimentScore(75).stockPrice((int)(currentPrice * 0.98)).kospiIndex(2548.5).build(),
                        StockDataResponseDto.DailyMetricDto.builder().day("11.06").fullDate("2026.11.06").sentimentScore(80).stockPrice((int)(currentPrice * 1.01)).kospiIndex(2538.9).build(),
                        StockDataResponseDto.DailyMetricDto.builder().day("11.07").fullDate("2026.11.07").sentimentScore(76).stockPrice((int)(currentPrice * 0.99)).kospiIndex(2541.0).build(),
                        StockDataResponseDto.DailyMetricDto.builder().day("11.08").fullDate("2026.11.08").sentimentScore(74).stockPrice((int)(currentPrice * 0.995)).kospiIndex(2535.4).build(),
                        StockDataResponseDto.DailyMetricDto.builder().day("11.09").fullDate("2026.11.09").sentimentScore(78).stockPrice(currentPrice).kospiIndex(kospiIndex).build()
                ))
                .yearlyChartData(yearlyChartData)
                .panicDefense(panicDefense)
                .newsSummary3Lines(List.of(
                        StockDataResponseDto.NewsItemDto.builder()
                                .id("1")
                                .title("글로벌 신규 수주 확대 및 실적 개선 모멘텀")
                                .source("연합인포맥스")
                                .timeAgo("1시간 전")
                                .sentiment("positive")
                                .sentimentLabel("호재")
                                .summary("주력 사업부문의 글로벌 공급망 확대에 힘입어 분기 실적 턴어라운드가 기대됩니다.")
                                .build(),
                        StockDataResponseDto.NewsItemDto.builder()
                                .id("2")
                                .title("적극적 주주가치 제고 및 기관 순매수 유입")
                                .source("한국경제")
                                .timeAgo("3시간 전")
                                .sentiment("positive")
                                .sentimentLabel("호재")
                                .summary("자사주 정책 및 배당 확대 기대감으로 기관 수급이 하방 지지선을 강화하고 있습니다.")
                                .build(),
                        StockDataResponseDto.NewsItemDto.builder()
                                .id("3")
                                .title("매크로 지수 변동성에 따른 수급 숨고르기")
                                .source("매일경제")
                                .timeAgo("5시간 전")
                                .sentiment("neutral")
                                .sentimentLabel("이슈")
                                .summary("시장 전반의 금리 및 환율 변동성으로 외국인 수급이 단기 관망세를 나타내고 있습니다.")
                                .build()
                ))
                .finalConclusion(finalConclusion)
                .build();

        return ResponseEntity.ok(response);
    }

    // KOSPI 대비 상대 수익률 기반 패닉 디펜스 알고리즘
    private StockDataResponseDto.PanicDefenseInfoDto buildPanicDefense(double stockChange, double kospiChange, String stockName) {
        double relativePerformance = Math.round((stockChange - kospiChange) * 100.0) / 100.0;
        String defenseType;
        String badgeText;
        String headline;
        String recommendation;

        if (kospiChange < -0.8 && relativePerformance > 1.0) {
            defenseType = "firm_divergence";
            badgeText = "패닉 디펜스 발동";
            headline = String.format("코스피(%.2f%%) 대비 %s 상대 수익률 +%.2f%%p로 하방 방어 우수", kospiChange, stockName, relativePerformance);
            recommendation = "지수 급락에 따른 시장 패닉 심리에 동요하지 마시고, 견조한 지지력을 바탕으로 보유 포지션 유지를 권장합니다.";
        } else if (stockChange >= 2.0) {
            defenseType = "bullish_rally";
            badgeText = "AI 안심 방어 가이드";
            headline = String.format("%s 주도 수급 유입으로 지수 대비 +%.2f%%p 초과 상승", stockName, relativePerformance);
            recommendation = "상승 탄력이 견조하게 유지되고 있습니다. 고점 추격 매수보다는 1차 눌림목에서의 분할 진입이 유리합니다.";
        } else if (stockChange < -2.0 && relativePerformance < -1.0) {
            defenseType = "market_drop";
            badgeText = "심리 안심 케어";
            headline = String.format("시장 대비 상대적 낙폭 과대 구간 (차이: %.2f%%p)", relativePerformance);
            recommendation = "단기 수급 불균형으로 인한 과매도 구간입니다. 감정적 뇌동매매를 피하고 지지선 반등 여부를 먼저 점검하세요.";
        } else {
            defenseType = "market_rebound";
            badgeText = "시장 동조화 관망";
            headline = "코스피 지수 흐름에 동조화된 안정적 숨고르기";
            recommendation = "시장 전반의 방향성이 뚜렷해질 때까지 신규 비중 확대를 자제하고 분할 관망 전략을 권장합니다.";
        }

        return StockDataResponseDto.PanicDefenseInfoDto.builder()
                .isActive(true)
                .stockChangePercent(stockChange)
                .kospiChangePercent(kospiChange)
                .badgeText(badgeText)
                .headline(headline)
                .recommendation(recommendation)
                .defenseType(defenseType)
                .build();
    }

    // 기술적 지표 기반 최종 결론 산출 알고리즘
    private StockDataResponseDto.FinalConclusionDto buildFinalConclusion(int currentPrice, double changeRate, double ma20) {
        String badge;
        String guidance;
        int support = (int) (currentPrice * 0.96);
        int resistance = (int) (currentPrice * 1.05);

        if (currentPrice > ma20 && changeRate > 0) {
            badge = "분할 매수 추천";
            guidance = String.format("20일선(%,d원) 위에 안착하여 단기 상승 추세가 살아있습니다. 눌림목 형성 시 분할 매수로 대응하세요.", (int) ma20);
        } else if (currentPrice < ma20) {
            badge = "관망 추천";
            guidance = String.format("20일선(%,d원)을 하회하고 있으므로 무리한 진입보다는 1차 지지선(%,d원) 안착을 먼저 확인하세요.", (int) ma20, support);
        } else {
            badge = "리스크 관리";
            guidance = "박스권 횡보 구간입니다. 지지선 이탈 시 손절 기준을 엄격히 준수하고 비중 조절에 유의하세요.";
        }

        return StockDataResponseDto.FinalConclusionDto.builder()
                .badge(badge)
                .guidance(guidance)
                .targetSupport(String.format("지지선 %,d원 / 목표 저항선 %,d원", support, resistance))
                .psychologicalTip("추격 매수보다는 20일선과 지지선을 기준 삼은 계획적 분할 접근이 리스크를 낮춥니다.")
                .build();
    }

    @SuppressWarnings("rawtypes")
    private List<StockDataResponseDto.YearlyCandlePointDto> buildYearlyChartData(List rawList) {
        if (rawList == null || rawList.isEmpty()) {
            return Collections.emptyList();
        }

        List reversedList = new ArrayList<>(rawList);
        Collections.reverse(reversedList);

        List<StockDataResponseDto.YearlyCandlePointDto> result = new ArrayList<>();
        List<Integer> closePrices = new ArrayList<>();

        for (Object item : reversedList) {
            if (item instanceof Map) {
                Map map = (Map) item;
                try {
                    String rawDate = String.valueOf(map.get("stck_bsop_date"));
                    String formattedDate = rawDate.length() >= 8 ?
                            rawDate.substring(0, 4) + "." + rawDate.substring(4, 6) : rawDate;
                    String label = rawDate.length() >= 8 ?
                            "'" + rawDate.substring(2, 4) + "." + rawDate.substring(4, 6) : rawDate;

                    int close = Integer.parseInt(String.valueOf(map.get("stck_clpr")).replaceAll("[^0-9]", ""));
                    closePrices.add(close);

                    double ma20 = calculateMA(closePrices, 20);
                    double ma60 = calculateMA(closePrices, 60);

                    result.add(StockDataResponseDto.YearlyCandlePointDto.builder()
                            .date(formattedDate)
                            .label(label)
                            .open(Integer.parseInt(String.valueOf(map.get("stck_oprc")).replaceAll("[^0-9]", "")))
                            .high(Integer.parseInt(String.valueOf(map.get("stck_hgpr")).replaceAll("[^0-9]", "")))
                            .low(Integer.parseInt(String.valueOf(map.get("stck_lwpr")).replaceAll("[^0-9]", "")))
                            .close(close)
                            .volume(Long.parseLong(String.valueOf(map.get("acml_vol")).replaceAll("[^0-9]", "")))
                            .ma20(ma20)
                            .ma60(ma60)
                            .build());
                } catch (Exception ignored) {
                }
            }
        }
        return result;
    }

    private double calculateMA(List<Integer> prices, int period) {
        if (prices.size() < period) {
            return prices.stream().mapToInt(Integer::intValue).average().orElse(0.0);
        }
        int sum = 0;
        for (int i = prices.size() - period; i < prices.size(); i++) {
            sum += prices.get(i);
        }
        return Math.round((double) sum / period * 100.0) / 100.0;
    }
}