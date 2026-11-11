package com.moodon.backend;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_prices")
public class StockPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    private Long priceId;

    @Column(name = "stock_code", nullable = false, length = 20)
    private String stockCode;

    @Column(name = "trade_date", nullable = false)
    private LocalDate tradeDate;

    @Column(name = "open_price")
    private Integer openPrice;

    @Column(name = "high_price")
    private Integer highPrice;

    @Column(name = "low_price")
    private Integer lowPrice;

    @Column(name = "close_price", nullable = false)
    private Integer closePrice;

    @Column(name = "volume")
    private Long volume;

    @Column(name = "change_rate", precision = 5, scale = 2)
    private BigDecimal changeRate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public StockPrice() {}

    public Long getPriceId() { return priceId; }
    public String getStockCode() { return stockCode; }
    public void setStockCode(String stockCode) { this.stockCode = stockCode; }
    public LocalDate getTradeDate() { return tradeDate; }
    public void setTradeDate(LocalDate tradeDate) { this.tradeDate = tradeDate; }
    public Integer getOpenPrice() { return openPrice; }
    public void setOpenPrice(Integer openPrice) { this.openPrice = openPrice; }
    public Integer getHighPrice() { return highPrice; }
    public void setHighPrice(Integer highPrice) { this.highPrice = highPrice; }
    public Integer getLowPrice() { return lowPrice; }
    public void setLowPrice(Integer lowPrice) { this.lowPrice = lowPrice; }
    public Integer getClosePrice() { return closePrice; }
    public void setClosePrice(Integer closePrice) { this.closePrice = closePrice; }
    public Long getVolume() { return volume; }
    public void setVolume(Long volume) { this.volume = volume; }
    public BigDecimal getChangeRate() { return changeRate; }
    public void setChangeRate(BigDecimal changeRate) { this.changeRate = changeRate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
