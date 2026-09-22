package com.zoomhopr.vehicle.service;

import com.zoomhopr.vehicle.dto.VehicleRequest;
import com.zoomhopr.vehicle.dto.VehicleUpdateRequest;
import com.zoomhopr.vehicle.entity.Vehicle;
import com.zoomhopr.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;


    // =========================================================
    // CREATE VEHICLE
    // =========================================================

    public Vehicle create(VehicleRequest request) {

        Integer dailyKmLimit =
                request.dailyKmLimit() != null
                        ? request.dailyKmLimit()
                        : 300;

        BigDecimal extraKmRate =
                request.extraKmRate() != null
                        ? request.extraKmRate()
                        : BigDecimal.valueOf(15);

        Vehicle vehicle = Vehicle.builder()
                .ownerId(request.ownerId())
                .make(request.make())
                .model(request.model())
                .year(request.year())
                .fuelType(
                        Vehicle.FuelType.valueOf(
                                request.fuelType().toUpperCase()
                        )
                )
                .transmission(
                        Vehicle.Transmission.valueOf(
                                request.transmission().toUpperCase()
                        )
                )
                .registrationNumber(
                        request.registrationNumber()
                )
                .hourlyRate(
                        request.hourlyRate()
                )
                .dailyRate(
                        request.dailyRate()
                )
                .dailyKmLimit(
                        dailyKmLimit
                )
                .extraKmRate(
                        extraKmRate
                )
                .city(
                        request.city()
                )
                .currentLatitude(
                        request.currentLatitude()
                )
                .currentLongitude(
                        request.currentLongitude()
                )
                .build();

        return vehicleRepository.save(vehicle);
    }


    // =========================================================
    // SEARCH AVAILABLE VEHICLES
    // =========================================================

    public List<Vehicle> searchAvailable(
            String city,
            String fuelType,
            String transmission
    ) {

        if (fuelType != null && transmission != null) {

            return vehicleRepository
                    .findByCityAndFuelTypeAndTransmissionAndStatus(
                            city,
                            Vehicle.FuelType.valueOf(
                                    fuelType.toUpperCase()
                            ),
                            Vehicle.Transmission.valueOf(
                                    transmission.toUpperCase()
                            ),
                            Vehicle.VehicleStatus.AVAILABLE
                    );
        }

        return vehicleRepository.findByCityAndStatus(
                city,
                Vehicle.VehicleStatus.AVAILABLE
        );
    }


    // =========================================================
    // GET VEHICLE
    // =========================================================

    public Vehicle getById(String id) {

        return vehicleRepository.findById(id)
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Vehicle not found: " + id
                        )
                );
    }


    // =========================================================
    // UPDATE VEHICLE STATUS
    // =========================================================

    public Vehicle updateStatus(
            String id,
            String status
    ) {

        Vehicle vehicle = getById(id);

        vehicle.setStatus(
                Vehicle.VehicleStatus.valueOf(
                        status.toUpperCase()
                )
        );

        return vehicleRepository.save(vehicle);
    }


    // =========================================================
    // UPDATE HOST VEHICLE SETTINGS
    // =========================================================
    //
    // Host can change:
    //
    // - Hourly rate
    // - Daily rate
    // - Daily KM limit
    // - Extra KM rate
    //
    // =========================================================

    public Vehicle updateVehicle(
            String id,
            VehicleUpdateRequest request
    ) {

        Vehicle vehicle = getById(id);

        vehicle.setHourlyRate(
                request.hourlyRate()
        );

        vehicle.setDailyRate(
                request.dailyRate()
        );

        vehicle.setDailyKmLimit(
                request.dailyKmLimit()
        );

        vehicle.setExtraKmRate(
                request.extraKmRate()
        );

        return vehicleRepository.save(vehicle);
    }


    // =========================================================
    // GET VEHICLES BY OWNER
    // =========================================================

    public List<Vehicle> getByOwner(String ownerId) {

        return vehicleRepository.findByOwnerId(
                ownerId
        );
    }
}