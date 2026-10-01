package com.pratyush.spliteasy.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateGroupRequest(@NotBlank String name) {
}
