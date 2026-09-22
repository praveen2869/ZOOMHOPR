package com.zoomhopr.ridematch.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record RideSearchRequest(
        @NotNull Double lat,
        @NotNull Double lng,
        Double radiusKm,
        @NotNull Instant earliestDeparture,
        @NotNull Instant latestDeparture
) {}
