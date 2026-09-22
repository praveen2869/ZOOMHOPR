package com.zoomhopr.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record VehicleRequest(
        @NotBlank String ownerId,
        @NotBlank String make,
        @NotBlank String model,
        Integer year,
        @NotBlank String fuelType,
        @NotBlank String transmission,
        @NotBlank String registrationNumber,

        @NotNull
        @Positive
        BigDecimal hourlyRate,

        @NotNull
        @Positive
        BigDecimal dailyRate,

        Integer dailyKmLimit,

        @Positive
        BigDecimal extraKmRate,

        @NotBlank String city,

        Double currentLatitude,
        Double currentLongitude
) {
}