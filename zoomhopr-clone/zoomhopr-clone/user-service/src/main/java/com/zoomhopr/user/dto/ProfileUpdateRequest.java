package com.zoomhopr.user.dto;

public record ProfileUpdateRequest(
        String fullName,
        String profileImageUrl,
        String licenseNumber,
        String licenseImageUrl
) {}
