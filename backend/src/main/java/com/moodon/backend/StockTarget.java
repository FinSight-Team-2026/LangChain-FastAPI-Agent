package com.moodon.backend;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

@Getter
@RequiredArgsConstructor
public enum StockTarget {
    NAVER("035420", "NAVER"),
    SAMSUNG_ELECTRONICS("005930", "삼성전자"),
    SAMSUNG_ELECTRO_MECHANICS("009150", "삼성전기"),
    HYUNDAI_MOTOR("005380", "현대차"),
    SK_HYNIX("000660", "SK하이닉스");

    private final String code;
    private final String name;

    public static boolean isValidCode(String code) {
        return Arrays.stream(values()).anyMatch(target -> target.getCode().equals(code));
    }
}