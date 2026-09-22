package com.zoomhopr.booking.controller;

import com.zoomhopr.booking.dto.BookingRequest;
import com.zoomhopr.booking.dto.TripUpdateRequest;
import com.zoomhopr.booking.entity.Booking;
import com.zoomhopr.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Booking> startTrip(@PathVariable String id, @Valid @RequestBody TripUpdateRequest request) {
        return ResponseEntity.ok(bookingService.startTrip(id, request.odometerReading()));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<Booking> endTrip(@PathVariable String id, @Valid @RequestBody TripUpdateRequest request) {
        return ResponseEntity.ok(bookingService.endTrip(id, request.odometerReading()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancel(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    @GetMapping("/rider/{riderId}")
    public ResponseEntity<List<Booking>> getByRider(@PathVariable String riderId) {
        return ResponseEntity.ok(bookingService.getByRider(riderId));
    }
}
