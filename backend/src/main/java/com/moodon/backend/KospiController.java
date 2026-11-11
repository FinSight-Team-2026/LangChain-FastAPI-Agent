
package com.moodon.backend;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class KospiController {

    private final KisService kisService;

    public KospiController(KisService kisService) {
        this.kisService = kisService;
    }

    @GetMapping("/api/stocks/kospi")
    public Map<String, Object> getKospi() {
        return kisService.fetchKospiIndex();
    }
}
