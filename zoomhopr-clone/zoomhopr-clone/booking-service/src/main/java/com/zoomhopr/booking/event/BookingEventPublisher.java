package com.zoomhopr.booking.event;

import com.zoomhopr.booking.entity.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes domain events consumed by payment-service (to charge) and
 * notification-service (to alert the rider/host).
 */
@Component
@RequiredArgsConstructor
public class BookingEventPublisher {

    private static final String TOPIC = "booking-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishBookingConfirmed(Booking booking) {
        kafkaTemplate.send(TOPIC, booking.getId(), new BookingEvent(
                "BOOKING_CONFIRMED", booking.getId(), booking.getRiderId(),
                booking.getVehicleId(), booking.getEstimatedFare()));
    }

    public void publishBookingCompleted(Booking booking) {
        kafkaTemplate.send(TOPIC, booking.getId(), new BookingEvent(
                "BOOKING_COMPLETED", booking.getId(), booking.getRiderId(),
                booking.getVehicleId(), booking.getFinalFare()));
    }

    public record BookingEvent(String type, String bookingId, String riderId,
                                String vehicleId, java.math.BigDecimal amount) {}
}
