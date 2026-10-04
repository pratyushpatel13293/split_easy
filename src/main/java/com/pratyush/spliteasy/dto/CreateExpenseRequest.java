package com.pratyush.spliteasy.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateExpenseRequest(@NotBlank String description, @NotNull
 @Positive @Digits(integer = 10, fraction = 2) BigDecimal amount, @NotNull Long paidByUserId) {
}
