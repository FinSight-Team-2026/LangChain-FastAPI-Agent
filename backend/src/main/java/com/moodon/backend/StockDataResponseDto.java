package com.moodon.backend;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StockDataResponseDto {
    private String id;
    private String name;
    private String code;
    private String category;
    private StockQuoteDto quote;
    private Integer sentimentScore;
    private String sentimentStatus; // '긍정' | '매우 긍정' | '중립' | '주의' | '공포'
    private SentimentBreakdownDto sentimentBreakdown;
    private List<DailyMetricDto> metrics7d;
    private List<YearlyCandlePointDto> yearlyChartData;
    private PanicDefenseInfoDto panicDefense;
    private List<NewsItemDto> newsSummary3Lines;
    private FinalConclusionDto finalConclusion;

    @Getter
    @Builder
    public static class StockQuoteDto {
        private String code;
        private String name;
        private String englishName;
        private Integer currentPrice;
        private Integer changePrice;
        private Double changeRate;
        private Integer high52w;
        private Integer low52w;
        private Long volume;
        private Long tradingValue;
        private Long marketCap;
        private Integer openPrice;
        private Integer highPrice;
        private Integer lowPrice;
        private Integer prevClosePrice;
        private Double foreignOwnership;
        private Double per;
        private Double pbr;
    }

    @Getter
    @Builder
    public static class SentimentBreakdownDto {
        private Integer positive;
        private Integer neutral;
        private Integer negative;
    }

    @Getter
    @Builder
    public static class DailyMetricDto {
        private String day;        // e.g. "11.03"
        private String fullDate;   // e.g. "2026.11.03"
        private Integer sentimentScore;
        private Integer stockPrice;
        private Double kospiIndex;
    }

    @Getter
    @Builder
    public static class YearlyCandlePointDto {
        private String date;       // e.g. "2025.12"
        private String label;      // e.g. "'25.12"
        private Integer open;
        private Integer high;
        private Integer low;
        private Integer close;
        private Long volume;
        private Double ma20;
        private Double ma60;
    }

    @Getter
    @Builder
    public static class PanicDefenseInfoDto {
        private Boolean isActive;
        private Double stockChangePercent;
        private Double kospiChangePercent;
        private String badgeText;
        private String headline;
        private String recommendation;
        private String defenseType; // 'market_drop' | 'firm_divergence' | 'bullish_rally' | 'market_rebound'
    }

    @Getter
    @Builder
    public static class NewsItemDto {
        private String id;
        private String title;
        private String source;
        private String timeAgo;
        private String sentiment;      // 'positive' | 'neutral' | 'negative'
        private String sentimentLabel; // '호재' | '이슈' | '리스크'
        private String summary;
    }

    @Getter
    @Builder
    public static class FinalConclusionDto {
        private String badge; // '관망 추천' | '분할 매수 추천' | '적극 매수' | '리스크 관리'
        private String guidance;
        private String targetSupport;
        private String psychologicalTip;
    }
}