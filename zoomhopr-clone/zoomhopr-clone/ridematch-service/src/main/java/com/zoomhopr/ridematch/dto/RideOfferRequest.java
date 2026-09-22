package com.zoomhopr.ridematch.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;

public record RideOfferRequest(
        @NotBlank String driverId,
        @NotBlank String vehicleId,
        @NotNull Double originLat,
        @NotNull Double originLng,
        @NotBlank String originLabel,
        @NotNull Double destinationLat,
        @NotNull Double destinationLng,
        @NotBlank String destinationLabel,
        @NotNull Instant departureTime,
        @NotNull @Min(1) Integer availableSeats,
        @NotNull @Positive BigDecimal pricePerSeat,
        Boolean recurring
) {}
