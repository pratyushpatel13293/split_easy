package com.pratyush.spliteasy.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ExpenseSummaryResponse(Long id, String description, BigDecimal amount, Long paidByUserId, LocalDateTime createdAt ) {
}
