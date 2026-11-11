package com.moodon.backend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 회원 고유 번호 (PK)

    @Column(nullable = false, unique = true)
    private String username; // 회원 아이디

    @Column(nullable = false)
    private String password; // 비밀번호

    private String nickname; // 닉네임
}