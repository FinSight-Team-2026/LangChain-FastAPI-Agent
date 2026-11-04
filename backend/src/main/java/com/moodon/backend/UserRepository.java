package com.moodon.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 나중에 로그인을 위해 아이디(username)로 회원을 찾는 기능
    Optional<User> findByUsername(String username);
}