package com.zoomhopr.vehicle.dto;

import jakarta.validation.constraints.NotBlank;

public record VehicleStatusUpdateRequest(@NotBlank String status) {}
