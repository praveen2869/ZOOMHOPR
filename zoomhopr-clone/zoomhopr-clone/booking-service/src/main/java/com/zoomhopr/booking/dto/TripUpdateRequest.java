package com.zoomhopr.booking.dto;

import jakarta.validation.constraints.NotNull;

public record TripUpdateRequest(@NotNull Integer odometerReading) {}
