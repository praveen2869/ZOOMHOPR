package com.zoomhopr.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Declarative HTTP client to vehicle-service,
 * resolved via Eureka.
 */
@FeignClient(name = "VEHICLE-SERVICE")
public interface VehicleClient {

    @GetMapping("/api/vehicles/{id}")
    VehicleDto getVehicle(@PathVariable("id") String id);

    @PutMapping("/api/vehicles/{id}/status")
    VehicleDto updateStatus(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body
    );

    record VehicleDto(
            String id,
            String ownerId,
            BigDecimal hourlyRate,
            BigDecimal dailyRate,
            String status,
            Integer dailyKmLimit,
            BigDecimal extraKmRate
    ) {
    }
}