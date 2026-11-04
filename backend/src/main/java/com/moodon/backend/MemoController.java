package com.moodon.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional; // 1. import 추가
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MemoController {

    @Autowired
    private MemoRepository memoRepository;

    // 1. 데이터 저장 (Transactional 추가)
    @Transactional
    @GetMapping("/add")
    public String addMemo(@RequestParam String content) {
        Memo memo = new Memo();
        memo.setContent(content);
        memoRepository.save(memo); // DB에 저장
        return "데이터 저장 성공: " + content;
    }

    // 2. 저장된 데이터 목록 조회
    @GetMapping("/list")
    public List<Memo> getMemos() {
        return memoRepository.findAll(); // DB에서 전체 조회
    }
}