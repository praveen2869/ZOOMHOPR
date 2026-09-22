package com.zoomhopr.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record BookingRequest(
        @NotBlank String riderId,
        @NotBlank String vehicleId,
        @NotNull Instant startTime,
        @NotNull Instant endTime
) {}
