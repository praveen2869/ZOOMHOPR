package com.zoomhopr.ridematch.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "VEHICLE-SERVICE")
public interface VehicleClient {

    @GetMapping("/api/vehicles/{id}")
    VehicleDto getVehicle(@PathVariable("id") String id);

    record VehicleDto(
            String id,
            String ownerId,
            String status
    ) {
    }
}