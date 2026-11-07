package com.moodon.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, String> {
    List<Stock> findByStockNameContainingIgnoreCaseOrStockCodeContaining(String nameKeyword, String codeKeyword);
}