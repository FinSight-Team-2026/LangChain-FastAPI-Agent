package com.moodon.backend;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    // 1. 관심 종목 추가
    @Transactional
    public void addFavorite(String username, String stockCode, String stockName) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 이미 찜한 종목인지 중복 확인
        if (favoriteRepository.findByUserAndStockCode(user, stockCode).isPresent()) {
            throw new IllegalStateException("이미 관심 종목으로 등록된 종목입니다.");
        }

        Favorite favorite = new Favorite(user, stockCode, stockName);
        favoriteRepository.save(favorite);
    }

    // 2. 내 관심 종목 목록 조회
    public List<Favorite> getFavorites(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return favoriteRepository.findByUser(user);
    }

    // 3. 관심 종목 삭제 (해제)
    @Transactional
    public void removeFavorite(String username, String stockCode) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Favorite favorite = favoriteRepository.findByUserAndStockCode(user, stockCode)
                .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 관심 종목입니다."));

        favoriteRepository.delete(favorite);
    }
}