package com.moodon.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NewsSentimentRepository extends JpaRepository<NewsArticle, Long> {

    @Query(value = """
        SELECT 
            a.article_id AS articleId,
            a.title AS title,
            a.url AS url,
            a.published_at AS publishedAt,
            s.label AS label,
            s.score AS score,
            s.summary AS summary
        FROM news_articles a
        INNER JOIN news_sentiments s ON a.article_id = s.article_id
        WHERE a.stock_code = :stockCode
          AND (a.is_stock_relevant = 1 OR a.is_stock_relevant IS NULL)
        ORDER BY a.published_at DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<NewsSentimentProjection> findAnalyzedNews(
            @Param("stockCode") String stockCode, 
            @Param("limit") int limit
    );
}
