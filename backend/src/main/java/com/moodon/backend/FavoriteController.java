package com.moodon.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    // 관심 종목 추가 API (POST /api/favorites)
    @PostMapping
    public ResponseEntity<String> addFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        
        String email = resolveUsername(userDetails, request);
        if (email == null) {
            return ResponseEntity.status(401).body("인증된 사용자 정보를 찾을 수 없습니다.");
        }

        String stockCode = (String) request.get("stockCode");
        if (stockCode == null) stockCode = (String) request.get("stock_code");
        
        String stockName = (String) request.get("stockName");
        if (stockName == null) stockName = (String) request.get("stock_name");
        if (stockName == null) stockName = "주식종목";

        favoriteService.addFavorite(email, stockCode, stockName);
        return ResponseEntity.ok("관심 종목이 추가되었습니다.");
    }

    // 내 관심 종목 조회 API (GET /api/favorites)
    @GetMapping
    public ResponseEntity<List<Favorite>> getFavorites(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "userId", required = false) Object userId,
            @RequestParam(value = "user_id", required = false) Object user_id,
            @RequestParam(value = "username", required = false) String usernameParam) {
        
        Map<String, Object> reqMap = new java.util.HashMap<>();
        if (userId != null) reqMap.put("userId", userId);
        if (user_id != null) reqMap.put("userId", user_id);
        if (usernameParam != null) reqMap.put("username", usernameParam);

        String email = resolveUsername(userDetails, reqMap);
        if (email == null) {
            return ResponseEntity.ok(List.of());
        }

        try {
            List<Favorite> favorites = favoriteService.getFavorites(email);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    // 관심 종목 삭제 API (DELETE /api/favorites/{stockCode})
    @DeleteMapping("/{stockCode}")
    public ResponseEntity<String> removeFavoritePath(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable("stockCode") String stockCode,
            @RequestParam(value = "userId", required = false) Object userId,
            @RequestParam(value = "user_id", required = false) Object user_id,
            @RequestParam(value = "username", required = false) String usernameParam) {
        return deleteFavoriteInternal(userDetails, stockCode, userId, user_id, usernameParam);
    }

    @DeleteMapping
    public ResponseEntity<String> removeFavoriteQuery(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "stockCode", required = false) String stockCode,
            @RequestParam(value = "stock_code", required = false) String stock_code,
            @RequestParam(value = "userId", required = false) Object userId,
            @RequestParam(value = "user_id", required = false) Object user_id,
            @RequestParam(value = "username", required = false) String usernameParam) {
        String code = stockCode != null ? stockCode : stock_code;
        return deleteFavoriteInternal(userDetails, code, userId, user_id, usernameParam);
    }

    private ResponseEntity<String> deleteFavoriteInternal(UserDetails userDetails, String stockCode, Object userId, Object user_id, String usernameParam) {
        Map<String, Object> reqMap = new java.util.HashMap<>();
        if (userId != null) reqMap.put("userId", userId);
        if (user_id != null) reqMap.put("userId", user_id);
        if (usernameParam != null) reqMap.put("username", usernameParam);

        String email = resolveUsername(userDetails, reqMap);
        if (email == null) {
            return ResponseEntity.status(401).body("인증된 사용자 정보를 찾을 수 없습니다.");
        }

        favoriteService.removeFavorite(email, stockCode);
        return ResponseEntity.ok("관심 종목이 삭제되었습니다.");
    }

    // 문자열(이메일)과 숫자 ID 모두 안전하게 유저를 찾아내는 헬퍼 메서드
    private String resolveUsername(UserDetails userDetails, Map<String, Object> request) {
        if (userDetails != null) {
            return userDetails.getUsername();
        }
        
        Object rawParam = request.get("username") != null ? request.get("username") : 
                         (request.get("userId") != null ? request.get("userId") : request.get("user_id"));
        
        if (rawParam != null) {
            String paramStr = rawParam.toString().trim();
            
            // 1. 이메일 형태(문자열 username)인 경우 곧바로 DB 조회
            if (paramStr.contains("@")) {
                Optional<User> userOpt = userRepository.findByUsername(paramStr);
                if (userOpt.isPresent()) {
                    return userOpt.get().getUsername();
                }
            }
            
            // 2. 숫자 형태인 경우 PK(id)로 조회 시도
            try {
                Long uid = Long.valueOf(paramStr);
                Optional<User> userOpt = userRepository.findById(uid);
                if (userOpt.isPresent()) {
                    return userOpt.get().getUsername();
                }
            } catch (Exception ignored) {}
            
            // 3. 만약 파라미터 자체가 일반 문자열 아이디라면 그대로 조회 시도
            Optional<User> userOpt = userRepository.findByUsername(paramStr);
            if (userOpt.isPresent()) {
                return userOpt.get().getUsername();
            }
        }

        return null;
    }
}