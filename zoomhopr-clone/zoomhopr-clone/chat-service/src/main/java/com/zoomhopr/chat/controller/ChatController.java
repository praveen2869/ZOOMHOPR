package com.zoomhopr.chat.controller;

import com.zoomhopr.chat.model.ChatMessage;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MongoTemplate mongoTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate, MongoTemplate mongoTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.mongoTemplate = mongoTemplate;
    }

    // Client sends to /app/chat/{tripId}, broadcast goes out on /topic/chat/{tripId}
    @MessageMapping("/chat/{tripId}")
    public void handleMessage(@org.springframework.messaging.handler.annotation.DestinationVariable String tripId,
                               ChatMessage message) {
        message.setSentAt(Instant.now());
        message.setRideOrBookingId(tripId);
        mongoTemplate.save(message);
        messagingTemplate.convertAndSend("/topic/chat/" + tripId, message);
    }

    @GetMapping("/api/chat/{tripId}/history")
    public List<ChatMessage> history(@PathVariable String tripId) {
        return mongoTemplate.find(
                org.springframework.data.mongodb.core.query.Query.query(
                        org.springframework.data.mongodb.core.query.Criteria.where("rideOrBookingId").is(tripId)),
                ChatMessage.class);
    }
}
