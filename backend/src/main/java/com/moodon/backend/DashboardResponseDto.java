package com.moodon.backend;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class DashboardResponseDto {
    private MarketSummary kospiSummary;
    private List<StockSummary> stocks;

    @Getter
    @Builder
    public static class MarketSummary {
        private Double currentIndex;
        private Double changeRate;
        private String marketMoodBrief;
    }

    @Getter
    @Builder
    public static class StockSummary {
        private String stockCode;
        private String stockName;
        private Integer currentPrice;
        private Double changeRate;
        private Integer sentimentScore;
    }
}