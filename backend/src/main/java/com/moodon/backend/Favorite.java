package com.moodon.backend;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "favorites")
@Getter @Setter
@NoArgsConstructor
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 유저의 관심 종목인지 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 종목 코드 (예: "005930")
    @Column(nullable = false)
    private String stockCode;

    // 종목 이름 (예: "삼성전자")
    private String stockName;

    public Favorite(User user, String stockCode, String stockName) {
        this.user = user;
        this.stockCode = stockCode;
        this.stockName = stockName;
    }
}