package com.moodon.backend;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stocks")
public class Stock {

    @Id
    @Column(name = "stock_code", length = 10)
    private String stockCode;

    @Column(name = "stock_name", nullable = false, length = 100)
    private String stockName;

    @Column(name = "current_price")
    private Integer currentPrice;

    @Column(name = "change_rate", precision = 5, scale = 2)
    private BigDecimal changeRate;

    @Column(name = "volume")
    private Long volume;

    @Column(name = "trading_value")
    private Long tradingValue;

    @Column(name = "market", length = 20)
    private String market;

    @Column(name = "market_type", length = 10)
    private String marketType;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Stock() {}

    public String getStockCode() { return stockCode; }
    public void setStockCode(String stockCode) { this.stockCode = stockCode; }

    public String getStockName() { return stockName; }
    public void setStockName(String stockName) { this.stockName = stockName; }

    public Integer getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(Integer currentPrice) { this.currentPrice = currentPrice; }

    public BigDecimal getChangeRate() { return changeRate; }
    public void setChangeRate(BigDecimal changeRate) { this.changeRate = changeRate; }

    public Long getVolume() { return volume; }
    public void setVolume(Long volume) { this.volume = volume; }

    public Long getTradingValue() { return tradingValue; }
    public void setTradingValue(Long tradingValue) { this.tradingValue = tradingValue; }

    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }

    public String getMarketType() { return marketType; }
    public void setMarketType(String marketType) { this.marketType = marketType; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
