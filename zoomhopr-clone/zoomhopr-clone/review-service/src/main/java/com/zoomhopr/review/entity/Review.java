package com.zoomhopr.review.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "reviews")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String tripOrBookingId;

    @Column(nullable = false)
    private String reviewerId;

    @Column(nullable = false)
    private String revieweeId; // driver, host, or rider being reviewed

    @Column(nullable = false)
    private Integer rating; // 1-5

    private String comment;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
