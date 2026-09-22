package com.zoomhopr.ridematch.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JoinRideRequest(
        @NotBlank String riderId,
        @NotNull @Min(1) Integer seatsRequested
) {}
