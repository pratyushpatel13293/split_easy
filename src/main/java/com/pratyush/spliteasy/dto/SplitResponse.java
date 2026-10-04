package com.pratyush.spliteasy.dto;

import java.math.BigDecimal;

public record SplitResponse(Long userId, String userName, BigDecimal shareAmount) {
}
