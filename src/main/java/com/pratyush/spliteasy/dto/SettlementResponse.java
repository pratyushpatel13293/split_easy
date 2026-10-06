package com.pratyush.spliteasy.dto;

import java.math.BigDecimal;

public record SettlementResponse(Long fromUserId, Long toUserId, BigDecimal amount) {
}
