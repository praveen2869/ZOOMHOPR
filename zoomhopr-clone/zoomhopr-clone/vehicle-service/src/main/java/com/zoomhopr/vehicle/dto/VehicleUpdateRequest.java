package com.zoomhopr.vehicle.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record VehicleUpdateRequest(

        @NotNull
        @Positive
        BigDecimal hourlyRate,

        @NotNull
        @Positive
        BigDecimal dailyRate,

        @NotNull
        @Positive
        Integer dailyKmLimit,

        @NotNull
        @Positive
        BigDecimal extraKmRate

) {
}