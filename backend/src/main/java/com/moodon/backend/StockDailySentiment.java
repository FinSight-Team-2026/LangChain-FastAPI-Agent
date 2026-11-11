package com.moodon.backend;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_daily_sentiment")
public class StockDailySentiment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "daily_id")
    private Long dailyId;

    @Column(name = "stock_code", nullable = false, length = 20)
    private String stockCode;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "total_articles")
    private Integer totalArticles;

    @Column(name = "positive_count")
    private Integer positiveCount;

    @Column(name = "negative_count")
    private Integer negativeCount;

    @Column(name = "neutral_count")
    private Integer neutralCount;

    @Column(name = "avg_score")
    private Double avgScore;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public StockDailySentiment() {}

    public Long getDailyId() { return dailyId; }
    public String getStockCode() { return stockCode; }
    public LocalDate getTargetDate() { return targetDate; }
    public Integer getTotalArticles() { return totalArticles; }
    public Integer getPositiveCount() { return positiveCount; }
    public Integer getNegativeCount() { return negativeCount; }
    public Integer getNeutralCount() { return neutralCount; }
    public Double getAvgScore() { return avgScore; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}