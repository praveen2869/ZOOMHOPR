package com.zoomhopr.vehicle.repository;

import com.zoomhopr.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {

    List<Vehicle> findByCityAndStatus(String city, Vehicle.VehicleStatus status);

    List<Vehicle> findByOwnerId(String ownerId);

    List<Vehicle> findByCityAndFuelTypeAndTransmissionAndStatus(
            String city, Vehicle.FuelType fuelType, Vehicle.Transmission transmission, Vehicle.VehicleStatus status);
}
