package com.zoomhopr.auth.dto;

public record AuthResponse(
        String userId,
        String email,
        String role,
        String accessToken,
        String refreshToken
) {}
