
package com.moodon.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class StockPriceSyncController {

    private final StockPriceSyncService stockPriceSyncService;

    @PostMapping("/sync-test")
    public String testSync() {
        stockPriceSyncService.scheduledStockPriceSync();
        return "Stock price sync completed";
    }
}
