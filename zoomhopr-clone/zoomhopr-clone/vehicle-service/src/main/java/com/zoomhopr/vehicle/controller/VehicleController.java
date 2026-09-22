package com.zoomhopr.vehicle.controller;

import com.zoomhopr.vehicle.dto.VehicleRequest;
import com.zoomhopr.vehicle.dto.VehicleStatusUpdateRequest;
import com.zoomhopr.vehicle.dto.VehicleUpdateRequest;
import com.zoomhopr.vehicle.entity.Vehicle;
import com.zoomhopr.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    // =========================================================
    // CREATE VEHICLE
    // =========================================================

    @PostMapping
    public ResponseEntity<Vehicle> create(
            @Valid @RequestBody VehicleRequest request
    ) {
        return ResponseEntity.ok(
                vehicleService.create(request)
        );
    }

    // =========================================================
    // SEARCH AVAILABLE VEHICLES
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<List<Vehicle>> search(
            @RequestParam String city,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) String transmission
    ) {
        return ResponseEntity.ok(
                vehicleService.searchAvailable(
                        city,
                        fuelType,
                        transmission
                )
        );
    }

    // =========================================================
    // GET VEHICLE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(
                vehicleService.getById(id)
        );
    }

    // =========================================================
    // UPDATE VEHICLE STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<Vehicle> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody VehicleStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(
                vehicleService.updateStatus(
                        id,
                        request.status()
                )
        );
    }

    // =========================================================
    // UPDATE HOST VEHICLE SETTINGS
    // =========================================================
    //
    // Host can change:
    // - Hourly rate
    // - Daily rate
    // - Daily KM limit
    // - Extra KM rate
    //
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable String id,
            @Valid @RequestBody VehicleUpdateRequest request
    ) {
        return ResponseEntity.ok(
                vehicleService.updateVehicle(
                        id,
                        request
                )
        );
    }

    // =========================================================
    // GET VEHICLES BY OWNER
    // =========================================================

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Vehicle>> getByOwner(
            @PathVariable String ownerId
    ) {
        return ResponseEntity.ok(
                vehicleService.getByOwner(ownerId)
        );
    }
}