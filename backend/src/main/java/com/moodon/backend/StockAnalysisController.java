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

    private final KisService kisService;

    // 1. 메인 대시보드 API (상단 5개 퀵 셀렉터 카드용)
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDto> getDashboard() {
        Map<String, Object> kospiData = kisService.fetchKospiIndex();
        double kospiIndex = (double) kospiData.getOrDefault("index", 2540.30);
        double kospiChange = (double) kospiData.getOrDefault("changeRate", -1.15);

        String marketMood = kospiChange > 0.5 ? "KOSPI 상승세 지속 중" :
                (kospiChange < -0.5 ? "KOSPI 조정 및 관망세" : "KOSPI 보합권 횡보");

        List<DashboardResponseDto.StockSummary> stockSummaries = new ArrayList<>();

        for (StockTarget target : StockTarget.values()) {
            Stock syncedStock = kisService.fetchAndSyncCurrentPrice(target.getCode());

            int defaultSentiment = target.getCode().equals("000660") ? 85 :
                    (target.getCode().equals("005930") ? 65 :
                            (target.getCode().equals("009150") ? 78 :
                                    (target.getCode().equals("005380") ? 72 : 74)));

            stockSummaries.add(DashboardResponseDto.StockSummary.builder()
                    .stockCode(target.getCode())
                    .stockName(target.getName())
                    .currentPrice(syncedStock != null && syncedStock.getCurrentPrice() != null ? syncedStock.getCurrentPrice() : 0)
                    .changeRate(syncedStock != null && syncedStock.getChangeRate() != null ? syncedStock.getChangeRate().doubleValue() : 0.0)
                    .sentimentScore(defaultSentiment)
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

    // 2. 종목 상세 전체 뷰 API (축약형 코드 및 5대 핵심주 유연한 매핑)
    @GetMapping("/stocks/{code}/detail")
    public ResponseEntity<StockDataResponseDto> getStockDetail(@PathVariable String code) {
        String rawCode = (code == null || code.trim().isEmpty()) ? "035420" : code.trim();
        String targetCode = "035420";
        String stockName = "NAVER";

        // 프론트엔드 축약형 키워드 및 6자리 코드 완벽 방어 매핑
        if (rawCode.equals("000660") || rawCode.contains("SK") || rawCode.equalsIgnoreCase("SK_HYNIX")) {
            targetCode = "000660";
            stockName = "SK하이닉스";
        } else if (rawCode.equals("005930") || rawCode.contains("삼성전자") || rawCode.equalsIgnoreCase("SAMSUNG_ELECTRONICS") || rawCode.equalsIgnoreCase("SAMSUNG_ELEC")) {
            targetCode = "005930";
            stockName = "삼성전자";
        } else if (rawCode.equals("009150") || rawCode.contains("삼성전기") || rawCode.equalsIgnoreCase("SAMSUNG_ELECTRO_MECHANICS") || rawCode.equalsIgnoreCase("SAMSUNG_MECH")) {
            targetCode = "009150";
            stockName = "삼성전기";
        } else if (rawCode.equals("005380") || rawCode.contains("현대차") || rawCode.equalsIgnoreCase("HYUNDAI_MOTOR") || rawCode.equalsIgnoreCase("HYUNDAI_MOTORS")) {
            targetCode = "005380";
            stockName = "현대차";
        } else if (rawCode.equals("035420") || rawCode.contains("NAVER")) {
            targetCode = "035420";
            stockName = "NAVER";
        } else {
            for (StockTarget target : StockTarget.values()) {
                if (target.getCode().equals(rawCode) || target.name().equalsIgnoreCase(rawCode)) {
                    targetCode = target.getCode();
                    stockName = target.getName();
                    break;
                }
            }
        }

        // KIS 실시간 시세 동기화
        Stock stock = kisService.fetchAndSyncCurrentPrice(targetCode);
        int currentPrice = (stock != null && stock.getCurrentPrice() != null && stock.getCurrentPrice() > 0) 
                ? stock.getCurrentPrice() 
                : (targetCode.equals("000660") ? 1248000 : (targetCode.equals("005930") ? 201750 : (targetCode.equals("009150") ? 887000 : (targetCode.equals("005380") ? 271750 : 192600))));
        
        double changeRate = (stock != null && stock.getChangeRate() != null) ? stock.getChangeRate().doubleValue() : 1.25;
        long volume = (stock != null && stock.getVolume() != null) ? stock.getVolume() : 420000L;
        long tradingValue = (stock != null && stock.getTradingValue() != null) ? stock.getTradingValue() : 95000000000L;

        // KIS KOSPI 지수 조회
        Map<String, Object> kospiData = kisService.fetchKospiIndex();
        double kospiIndex = (double) kospiData.getOrDefault("index", 2540.30);
        double kospiChangePercent = (double) kospiData.getOrDefault("changeRate", -1.15);

        // 1년 일봉 데이터 수집 및 이동평균선(20일) 계산
        String endDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String startDate = LocalDate.now().minusYears(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        List rawCandles = kisService.fetchDailyPriceChart(targetCode, startDate, endDate);
        List<StockDataResponseDto.YearlyCandlePointDto> yearlyChartData = buildYearlyChartData(rawCandles);

        double latestMa20 = yearlyChartData.isEmpty() ? currentPrice :
                yearlyChartData.get(yearlyChartData.size() - 1).getMa20();

        // 종목별 고유 감성 점수 및 뉴스 다변화 데이터 설정
        int sentimentScore;
        int pos, neu, neg;
        List<StockDataResponseDto.NewsItemDto> newsList;

        if (targetCode.equals("000660")) { // SK하이닉스
            sentimentScore = 85;
            pos = 80; neu = 14; neg = 6;
            newsList = List.of(
                StockDataResponseDto.NewsItemDto.builder().id("1").title("고대역폭 메모리(HBM) 글로벌 수요 독점 가속화").source("서울경제").timeAgo("30분 전").sentiment("positive").sentimentLabel("호재").summary("AI 가속기 시장 확대에 따라 차세대 HBM 공급 계약 체결 소식이 전해졌습니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("2").title("외국인·기관 대규모 순매수 유입 지속").source("한국경제").timeAgo("2시간 전").sentiment("positive").sentimentLabel("호재").summary("반도체 업황 턴어라운드 기대감에 양대 주수급 주체의 매수세가 집중되고 있습니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("3").title("글로벌 반도체 공급망 가격 변동성 점검").source("연합인포맥스").timeAgo("4시간 전").sentiment("neutral").sentimentLabel("이슈").summary("단기 가격 급등에 따른 숨고르기 장세가 일부 나타나고 있습니다.").build()
            );
        } else if (targetCode.equals("005930")) { // 삼성전자
            sentimentScore = 65;
            pos = 60; neu = 25; neg = 15;
            newsList = List.of(
                StockDataResponseDto.NewsItemDto.builder().id("1").title("파운드리 사업부문 신규 고객사 확보 추진").source("전자신문").timeAgo("1시간 전").sentiment("positive").sentimentLabel("호재").summary("선단 공정 수율 개선과 함께 대형 글로벌 팹리스 수주 기대감이 유입 중입니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("2").title("스마트폰 부문 글로벌 점유율 방어 주력").source("매일경제").timeAgo("3시간 전").sentiment("neutral").sentimentLabel("이슈").summary("경쟁사 공세 속 프리미엄 라인업 판매 추이를 관망하는 분위기입니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("3").title("메모리 반도체 재고 조정 마무리 국면").source("머니투데이").timeAgo("5시간 전").sentiment("positive").sentimentLabel("호재").summary("하반기 서버용 메모리 수요 회복세가 뚜렷해지고 있습니다.").build()
            );
        } else if (targetCode.equals("009150")) { // 삼성전기
            sentimentScore = 78;
            pos = 75; neu = 18; neg = 7;
            newsList = List.of(
                StockDataResponseDto.NewsItemDto.builder().id("1").title("전장용 MLCC(적층세라믹콘덴서) 공급 확대").source("디지털타임스").timeAgo("45분 전").sentiment("positive").sentimentLabel("호재").summary("전기차 및 자율주행 부품 향 고부가가치 제품 비중이 빠르게 증가하고 있습니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("2").title("기판(Substrate) 사업부 실적 개선 가시화").source("연합뉴스").timeAgo("3시간 전").sentiment("positive").sentimentLabel("호재").summary("고성능 컴퓨팅 기판 수요 증가로 수익성 개선 폭이 확대되는 추세입니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("3").title("환율 변동에 따른 단기 실적 영향 제한적").source("이데일리").timeAgo("6시간 전").sentiment("neutral").sentimentLabel("이슈").summary("주요 수출국 환율 움직임에 연동된 완만한 흐름을 보이고 있습니다.").build()
            );
        } else if (targetCode.equals("005380")) { // 현대차
            sentimentScore = 72;
            pos = 70; neu = 20; neg = 10;
            newsList = List.of(
                StockDataResponseDto.NewsItemDto.builder().id("1").title("북미 하이브리드 및 전기차 판매 호조 이어져").source("한국경제").timeAgo("1시간 전").sentiment("positive").sentimentLabel("호재").summary("친환경차 라인업의 북미 시장 점유율 상승세가 실적을 견인하고 있습니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("2").title("적극적 주주환원 정책 및 자사주 매입 효과").source("파이낸셜뉴스").timeAgo("3시간 전").sentiment("positive").sentimentLabel("호재").summary("밸류업 프로그램에 부응하는 주주가치 제고 행보가 투자 심리를 지지합니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("3").title("글로벌 완성차 경쟁 심화 모니터링 필요").source("매일경제").timeAgo("5시간 전").sentiment("neutral").sentimentLabel("이슈").summary("현지 가격 경쟁 및 보조금 정책 변화에 따른 관망세가 혼재되어 있습니다.").build()
            );
        } else { // NAVER
            sentimentScore = 74;
            pos = 72; neu = 20; neg = 8;
            newsList = List.of(
                StockDataResponseDto.NewsItemDto.builder().id("1").title("AI 기반 검색 고도화 및 광고 매출 성장세").source("연합인포맥스").timeAgo("1시간 전").sentiment("positive").sentimentLabel("호재").summary("생성형 AI 서비스 도입 이후 플랫폼 체류 시간과 광고 효율이 동반 상승 중입니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("2").title("이커머스 생태계 확장 및 글로벌 제휴 강화").source("한국경제").timeAgo("3시간 전").sentiment("positive").sentimentLabel("호재").summary("커머스 부문의 견조한 거래액 유지와 함께 수익 다각화가 진행되고 있습니다.").build(),
                StockDataResponseDto.NewsItemDto.builder().id("3").title("플랫폼 규제 이슈 및 매크로 지수 영향 소강").source("매일경제").timeAgo("5시간 전").sentiment("neutral").sentimentLabel("이슈").summary("대외 불확실성 완화 속 실적 펀더멘털 중심의 수급이 유입되고 있습니다.").build()
            );
        }

        // 7일치 주가 및 감성 지표 동적 생성
        List<StockDataResponseDto.DailyMetricDto> metrics7d = List.of(
            StockDataResponseDto.DailyMetricDto.builder().day("11.03").fullDate("2026.11.03").sentimentScore(sentimentScore - 4).stockPrice((int)(currentPrice * 0.97)).kospiIndex(2550.2).build(),
            StockDataResponseDto.DailyMetricDto.builder().day("11.04").fullDate("2026.11.04").sentimentScore(sentimentScore - 2).stockPrice((int)(currentPrice * 0.98)).kospiIndex(2542.1).build(),
            StockDataResponseDto.DailyMetricDto.builder().day("11.05").fullDate("2026.11.05").sentimentScore(sentimentScore + 1).stockPrice((int)(currentPrice * 0.985)).kospiIndex(2548.5).build(),
            StockDataResponseDto.DailyMetricDto.builder().day("11.06").fullDate("2026.11.06").sentimentScore(sentimentScore + 3).stockPrice((int)(currentPrice * 1.005)).kospiIndex(2538.9).build(),
            StockDataResponseDto.DailyMetricDto.builder().day("11.07").fullDate("2026.11.07").sentimentScore(sentimentScore).stockPrice((int)(currentPrice * 0.995)).kospiIndex(2541.0).build(),
            StockDataResponseDto.DailyMetricDto.builder().day("11.08").fullDate("2026.11.08").sentimentScore(sentimentScore - 1).stockPrice((int)(currentPrice * 0.998)).kospiIndex(2535.4).build(),
            StockDataResponseDto.DailyMetricDto.builder().day("11.09").fullDate("2026.11.09").sentimentScore(sentimentScore).stockPrice(currentPrice).kospiIndex(kospiIndex).build()
        );

        StockDataResponseDto.PanicDefenseInfoDto panicDefense = buildPanicDefense(changeRate, kospiChangePercent, stockName);
        StockDataResponseDto.FinalConclusionDto finalConclusion = buildFinalConclusion(currentPrice, changeRate, latestMa20);

        StockDataResponseDto response = StockDataResponseDto.builder()
                .id(targetCode)
                .name(stockName)
                .code(targetCode)
                .category("KOSPI 대형주")
                .quote(StockDataResponseDto.StockQuoteDto.builder()
                        .code(targetCode)
                        .name(stockName)
                        .englishName(stockName)
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
                        .prevClosePrice(currentPrice != 0 ? (int) (currentPrice / (1 + (changeRate / 100.0))) : 0)
                        .foreignOwnership(32.5)
                        .per(11.2)
                        .pbr(1.05)
                        .build())
                .sentimentScore(sentimentScore)
                .sentimentStatus(sentimentScore >= 80 ? "매우 긍정" : (sentimentScore >= 70 ? "긍정" : "중립"))
                .sentimentBreakdown(StockDataResponseDto.SentimentBreakdownDto.builder()
                        .positive(pos)
                        .neutral(neu)
                        .negative(neg)
                        .build())
                .metrics7d(metrics7d)
                .yearlyChartData(yearlyChartData)
                .panicDefense(panicDefense)
                .newsSummary3Lines(newsList)
                .finalConclusion(finalConclusion)
                .build();

        return ResponseEntity.ok(response);
    }

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