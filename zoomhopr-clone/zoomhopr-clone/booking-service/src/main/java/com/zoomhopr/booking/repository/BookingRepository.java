package com.zoomhopr.booking.repository;

import com.zoomhopr.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByRiderId(String riderId);
    List<Booking> findByVehicleIdAndStatusIn(String vehicleId, List<Booking.BookingStatus> statuses);
}
