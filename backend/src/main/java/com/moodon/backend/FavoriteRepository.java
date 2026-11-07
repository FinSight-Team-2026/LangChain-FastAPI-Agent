package com.moodon.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // 특정 유저의 모든 관심 종목 조회 (가입 직후엔 빈 리스트 반환됨)
    List<Favorite> findByUser(User user);

    // 특정 유저가 이미 특정 종목을 찜했는지 확인 (중복 방지용)
    Optional<Favorite> findByUserAndStockCode(User user, String stockCode);
}