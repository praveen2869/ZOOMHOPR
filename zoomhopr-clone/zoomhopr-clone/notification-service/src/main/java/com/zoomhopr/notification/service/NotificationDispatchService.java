package com.zoomhopr.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationDispatchService {

    // Wire up FCM / Twilio / SES here. Kept simple so the flow is easy to trace end-to-end.
    public void send(String userId, String message) {
        log.info("Dispatching notification to user {}: {}", userId, message);
    }
}
