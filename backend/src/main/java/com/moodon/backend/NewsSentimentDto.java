package com.moodon.backend;

public interface NewsSentimentDto {
    Long getArticleId();
    String getTitle();
    String getUrl();
    String getPublishedAt();
    String getLabel();
    Double getScore();
    String getSummary();
}
