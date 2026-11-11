package com.moodon.backend;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // 토큰 서명을 위한 비밀키 (충분히 길게 작성해야 안전합니다)
    private final String SECRET_KEY_STRING = "moodonSecretKeyForJwtAuthenticationWithSpringSecurity2026";
    private final SecretKey secretKey = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes(StandardCharsets.UTF_8));

    // 토큰 유효 시간 (예: 1시간 = 1000 * 60 * 60)
    private final long EXPIRATION_TIME = 1000 * 60 * 60;

    // 1. JWT 토큰 생성 메서드
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    // 2. 토큰에서 사용자 아이디(username) 추출 메서드
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // 3. 토큰 유효성 검증 메서드
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false; // 토큰이 변조되었거나 만료된 경우
        }
    }
}