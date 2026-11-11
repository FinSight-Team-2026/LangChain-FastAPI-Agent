
package com.moodon.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class KospiController {

    private final KospiService kospiService;

    public KospiController(KospiService kospiService) {
        this.kospiService = kospiService;
    }

    @GetMapping("/kospi")
    public ResponseEntity<?> getKospi() {
        try {
            return ResponseEntity.ok(kospiService.getKospi());
        } catch (Exception e) {
            return ResponseEntity.status(502).body(
                    Map.of(
                            "error", "KOSPI 조회 실패",
                            "message", e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/kospi/daily")
    public ResponseEntity<?> getKospiDaily() {
        try {
            return ResponseEntity.ok(
                    kospiService.getKospiDaily()
            );
        } catch (Exception e) {
            return ResponseEntity.status(502).body(
                    Map.of(
                            "error", "KOSPI 일별 지수 조회 실패",
                            "message", e.getMessage()
                    )
            );
        }
    }
}
