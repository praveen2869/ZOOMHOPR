package com.zoomhopr.ridematch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** A rider's booked seat(s) on a RideOffer. */
@Entity
@Table(name = "ride_requests")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RideRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String rideOfferId;

    @Column(nullable = false)
    private String riderId;

    @Column(nullable = false)
    private Integer seatsRequested;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status; // PENDING, ACCEPTED, REJECTED, CANCELLED

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = RequestStatus.PENDING;
    }

    public enum RequestStatus { PENDING, ACCEPTED, REJECTED, CANCELLED }
}
