package com.moodon.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NewsSentimentRepository extends JpaRepository<NewsArticle, Long> {

    // LIMIT 에러를 원천 방지하기 위해 Pageable을 사용하는 방법 또는 JPQL 활용
    @Query("""
        SELECT new com.moodon.backend.NewsSentimentDto(
            a.articleId, 
            a.title, 
            a.url, 
            a.publishedAt, 
            s.label, 
            s.score, 
            s.summary
        )
        FROM NewsArticle a
        JOIN NewsSentiment s ON a.articleId = s.articleId
        WHERE a.stockCode = :stockCode
          AND (a.isStockRelevant = 1 OR a.isStockRelevant IS NULL)
        ORDER BY a.publishedAt DESC
    """)
    List<NewsSentimentDto> findAnalyzedNews(@Param("stockCode") String stockCode);
}