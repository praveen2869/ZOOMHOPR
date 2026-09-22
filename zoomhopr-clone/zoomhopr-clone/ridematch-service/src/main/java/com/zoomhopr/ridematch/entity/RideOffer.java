package com.zoomhopr.ridematch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/** A driver offering seats along a route — the core Hopr-style entity. */
@Entity
@Table(name = "ride_offers")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RideOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String driverId;

    @Column(nullable = false)
    private String vehicleId;

    @Column(nullable = false)
    private Double originLat;
    @Column(nullable = false)
    private Double originLng;
    @Column(nullable = false)
    private String originLabel;

    @Column(nullable = false)
    private Double destinationLat;
    @Column(nullable = false)
    private Double destinationLng;
    @Column(nullable = false)
    private String destinationLabel;

    @Column(nullable = false)
    private Instant departureTime;

    @Column(nullable = false)
    private Integer availableSeats;

    @Column(nullable = false)
    private BigDecimal pricePerSeat;

    private Boolean recurring;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = RideStatus.OPEN;
        if (this.recurring == null) this.recurring = false;
    }

    public enum RideStatus { OPEN, FULL, COMPLETED, CANCELLED }
}
