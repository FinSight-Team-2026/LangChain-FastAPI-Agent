package com.moodon.backend;

public interface NewsSentimentProjection {
    Long getArticleId();
    String getTitle();
    String getUrl();
    String getPublishedAt();
    String getLabel();
    Double getScore();
    String getSummary();
}
