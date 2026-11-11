package com.moodon.backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles")
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "article_id")
    private Long articleId;

    @Column(name = "stock_code", nullable = false, length = 10)
    private String stockCode;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 500, unique = true)
    private String url;

    @Column(name = "published_at", length = 30)
    private String publishedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "analysis_status", length = 20)
    private String analysisStatus;

    @Column(name = "is_stock_relevant", nullable = false)
    private Integer isStockRelevant;

    @Column(name = "irrelevant_reason", length = 100)
    private String irrelevantReason;

    public NewsArticle() {}

    public Long getArticleId() { return articleId; }
    public String getStockCode() { return stockCode; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public String getUrl() { return url; }
    public String getPublishedAt() { return publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getAnalysisStatus() { return analysisStatus; }
    public Integer getIsStockRelevant() { return isStockRelevant; }
    public String getIrrelevantReason() { return irrelevantReason; }
}
