package com.pratyush.spliteasy.dto;

import java.util.List;

public record GroupDetailsResponse(Long id, String name, List<UserResponse> members) {
}
