package com.zoomhopr.booking.service;

import com.zoomhopr.booking.client.VehicleClient;
import com.zoomhopr.booking.dto.BookingRequest;
import com.zoomhopr.booking.entity.Booking;
import com.zoomhopr.booking.event.BookingEventPublisher;
import com.zoomhopr.booking.repository.BookingRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleClient vehicleClient;
    private final BookingEventPublisher eventPublisher;

    private static final List<Booking.BookingStatus> ACTIVE_STATUSES =
            List.of(
                    Booking.BookingStatus.PENDING,
                    Booking.BookingStatus.CONFIRMED,
                    Booking.BookingStatus.ONGOING
            );

    private static final int DEFAULT_DAILY_KM_LIMIT = 300;

    private static final BigDecimal DEFAULT_EXTRA_KM_RATE =
            BigDecimal.valueOf(15);

    public Booking createBooking(BookingRequest request) {

        VehicleClient.VehicleDto vehicle =
                getVehicleWithFallback(request.vehicleId());

        if (!"AVAILABLE".equalsIgnoreCase(vehicle.status())) {
            throw new IllegalStateException(
                    "Vehicle is not available for booking"
            );
        }

        BigDecimal fare =
                calculateFare(
                        vehicle,
                        request.startTime(),
                        request.endTime()
                );

        int rentalDays =
                calculateRentalDays(
                        request.startTime(),
                        request.endTime()
                );

        int dailyKmLimit =
                vehicle.dailyKmLimit() != null
                        ? vehicle.dailyKmLimit()
                        : DEFAULT_DAILY_KM_LIMIT;

        BigDecimal extraKmRate =
                vehicle.extraKmRate() != null
                        ? vehicle.extraKmRate()
                        : DEFAULT_EXTRA_KM_RATE;

        int allowedKm =
                rentalDays * dailyKmLimit;

        Booking booking = Booking.builder()
                .riderId(request.riderId())
                .vehicleId(request.vehicleId())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .estimatedFare(fare)

                .allowedKm(allowedKm)
                .extraKmRate(extraKmRate)
                .extraKm(0)
                .extraKmCharge(BigDecimal.ZERO)
                .distanceKm(0)

                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        booking = bookingRepository.save(booking);

        vehicleClient.updateStatus(
                request.vehicleId(),
                Map.of("status", "BOOKED")
        );

        eventPublisher.publishBookingConfirmed(booking);

        return booking;
    }

    @CircuitBreaker(
            name = "vehicleService",
            fallbackMethod = "vehicleFallback"
    )
    public VehicleClient.VehicleDto getVehicleWithFallback(
            String vehicleId
    ) {
        return vehicleClient.getVehicle(vehicleId);
    }

    public VehicleClient.VehicleDto vehicleFallback(
            String vehicleId,
            Throwable t
    ) {
        throw new IllegalStateException(
                "Vehicle service unavailable, please retry booking shortly"
        );
    }

    private BigDecimal calculateFare(
            VehicleClient.VehicleDto vehicle,
            Instant start,
            Instant end
    ) {

        long hours = Math.max(
                1,
                Duration.between(start, end).toHours()
        );

        if (hours >= 24) {

            long days =
                    hours / 24
                            + (hours % 24 == 0 ? 0 : 1);

            return vehicle.dailyRate()
                    .multiply(
                            BigDecimal.valueOf(days)
                    );
        }

        return vehicle.hourlyRate()
                .multiply(
                        BigDecimal.valueOf(hours)
                );
    }

    private int calculateRentalDays(
            Instant start,
            Instant end
    ) {

        long hours = Math.max(
                1,
                Duration.between(start, end).toHours()
        );

        return (int) Math.max(
                1,
                (hours + 23) / 24
        );
    }

    public Booking startTrip(
            String bookingId,
            Integer odometer
    ) {

        Booking booking = getById(bookingId);

        if (booking.getStatus()
                != Booking.BookingStatus.CONFIRMED) {

            throw new IllegalStateException(
                    "Only confirmed bookings can be started"
            );
        }

        booking.setStatus(
                Booking.BookingStatus.ONGOING
        );

        booking.setActualStartTime(
                Instant.now()
        );

        booking.setStartOdometer(
                odometer
        );

        return bookingRepository.save(booking);
    }

    public Booking endTrip(
            String bookingId,
            Integer odometer
    ) {

        Booking booking = getById(bookingId);

        if (booking.getStatus()
                != Booking.BookingStatus.ONGOING) {

            throw new IllegalStateException(
                    "Only ongoing bookings can be completed"
            );
        }

        if (booking.getStartOdometer() == null) {
            throw new IllegalStateException(
                    "Starting odometer is missing"
            );
        }

        if (odometer < booking.getStartOdometer()) {
            throw new IllegalArgumentException(
                    "Ending odometer cannot be less than starting odometer"
            );
        }

        int distance =
                odometer - booking.getStartOdometer();

        int allowedKm =
        booking.getAllowedKm() != null
                ? booking.getAllowedKm()
                : DEFAULT_DAILY_KM_LIMIT
                    * calculateRentalDays(
                        booking.getStartTime(),
                        booking.getEndTime()
                    );

        int extraKm =
                Math.max(
                        0,
                        distance - allowedKm
                );

        BigDecimal extraKmRate =
                booking.getExtraKmRate() != null
                        ? booking.getExtraKmRate()
                        : DEFAULT_EXTRA_KM_RATE;

        BigDecimal extraKmCharge =
                extraKmRate.multiply(
                        BigDecimal.valueOf(extraKm)
                );

        BigDecimal estimatedFare =
                booking.getEstimatedFare() != null
                        ? booking.getEstimatedFare()
                        : BigDecimal.ZERO;

        BigDecimal finalFare =
                estimatedFare.add(extraKmCharge);

        booking.setStatus(
                Booking.BookingStatus.COMPLETED
        );

        booking.setActualEndTime(
                Instant.now()
        );

        booking.setEndOdometer(
                odometer
        );

        booking.setDistanceKm(
                distance
        );

        booking.setExtraKm(
                extraKm
        );

        booking.setExtraKmRate(
                extraKmRate
        );

        booking.setExtraKmCharge(
                extraKmCharge
        );

        booking.setFinalFare(
                finalFare
        );

        booking = bookingRepository.save(booking);

        vehicleClient.updateStatus(
                booking.getVehicleId(),
                Map.of("status", "AVAILABLE")
        );

        eventPublisher.publishBookingCompleted(
                booking
        );

        return booking;
    }

    public Booking cancel(String bookingId) {

        Booking booking = getById(bookingId);

        booking.setStatus(
                Booking.BookingStatus.CANCELLED
        );

        booking = bookingRepository.save(booking);

        vehicleClient.updateStatus(
                booking.getVehicleId(),
                Map.of("status", "AVAILABLE")
        );

        return booking;
    }

    public Booking getById(String id) {

        return bookingRepository.findById(id)
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Booking not found: " + id
                        )
                );
    }

    public List<Booking> getByRider(String riderId) {

        return bookingRepository.findByRiderId(
                riderId
        );
    }
}