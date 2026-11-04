package com.moodon.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
   @Autowired
   private UserRepository userRepository;
   
   @Autowired
   private PasswordEncoder passwordEncoder;
   
   @Autowired
   private JwtUtil jwtUtil;

   public UserController() {
   }

   // 회원가입
   @Transactional
   @PostMapping({"/signup"})
   public String signup(@RequestBody Map<String, String> requestMap) {
      String username = requestMap.get("username");
      String password = requestMap.get("password");
      String name = requestMap.get("name");

      if (this.userRepository.findByUsername(username).isPresent()) {
         return "회원가입 실패: 이미 존재하는 아이디입니다.";
      } else {
         User user = new User();
         user.setUsername(username);
         user.setPassword(this.passwordEncoder.encode(password));
         user.setNickname(name != null ? name : username);
         this.userRepository.save(user);
         return "회원가입 성공! 환영합니다, " + name + "님!";
      }
   }

   // 로그인
   @GetMapping({"/login"})
   public String login(@RequestParam String username, @RequestParam String password) {
      User user = this.userRepository.findByUsername(username).orElse(null);
      if (user == null) {
         return "로그인 실패: 존재하지 않는 아이디입니다.";
      } else if (!this.passwordEncoder.matches(password, user.getPassword())) {
         return "로그인 실패: 비밀번호가 일치하지 않습니다.";
      } else {
         String token = this.jwtUtil.generateToken(user.getUsername());
         String nickname = user.getNickname();
         return "로그인 성공! " + nickname + "님 반갑습니다.\n[발급된 JWT 토큰]: " + token;
      }
   }

   @Transactional
   @GetMapping({"/update"})
   public String updateUserInfo(@RequestParam String username, @RequestParam String newNickname) {
      User user = this.userRepository.findByUsername(username).orElse(null);
      if (user == null) {
         return "회원 정보 수정 실패: 존재하지 않는 아이디입니다.";
      } else {
         user.setNickname(newNickname);
         this.userRepository.save(user);
         return "회원 정보 수정 성공! 변경된 닉네임: " + newNickname;
      }
   }

   @Transactional
   @GetMapping({"/delete"})
   public String deleteUser(@RequestParam String username, @RequestParam String password) {
      User user = this.userRepository.findByUsername(username).orElse(null);
      if (user == null) {
         return "회원 탈퇴 실패: 존재하지 않는 아이디입니다.";
      } else if (!this.passwordEncoder.matches(password, user.getPassword())) {
         return "회원 탈퇴 실패: 비밀번호가 일치하지 않습니다.";
      } else {
         this.userRepository.delete(user);
         return "회원 탈퇴가 정상적으로 완료되었습니다. 그동안 이용해 주셔서 감사합니다.";
      }
   }
}