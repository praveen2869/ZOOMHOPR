package com.zoomhopr.notification.listener;

import com.zoomhopr.notification.service.NotificationDispatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEventListener {

    private final NotificationDispatchService dispatchService;

    @KafkaListener(topics = "booking-events", groupId = "notification-service")
    public void onBookingEvent(Map<String, Object> event) {
        log.info("Received booking event: {}", event);
        String type = String.valueOf(event.get("type"));
        String riderId = String.valueOf(event.get("riderId"));

        switch (type) {
            case "BOOKING_CONFIRMED" -> dispatchService.send(riderId,
                    "Your booking is confirmed! Your ride is ready.");
            case "BOOKING_COMPLETED" -> dispatchService.send(riderId,
                    "Trip completed. Thanks for riding with us!");
            default -> log.warn("Unhandled event type: {}", type);
        }
    }
}
