package com.pratyush.spliteasy.dto;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;

public record ExpenseResponse(Long id, String description, BigDecimal amount, Long paidByUserId, LocalDateTime createdAt, List<SplitResponse> splits) {
}


