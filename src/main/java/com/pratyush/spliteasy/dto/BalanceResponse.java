package com.pratyush.spliteasy.dto;

import java.math.BigDecimal;

public record BalanceResponse(Long userId, String userName, BigDecimal balance) {

}
