package com.zoomhopr.vehicle.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Owner: either a Zoomcar-style fleet operator, or a peer host listing their own car
    @Column(nullable = false)
    private String ownerId;

    @Column(nullable = false)
    private String make;

    @Column(nullable = false)
    private String model;

    private Integer year;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    private Transmission transmission;

    @Column(nullable = false)
    private String registrationNumber;

    @Column(nullable = false)
    private BigDecimal hourlyRate;

    @Column(nullable = false)
    private BigDecimal dailyRate;

    /*
     * Maximum kilometres allowed per rental day.
     *
     * Example:
     * 300 km/day
     * 3 day booking = 900 km allowed
     */
    private Integer dailyKmLimit;

    /*
     * Amount charged for every kilometre above the allowed limit.
     *
     * Example:
     * ₹15 per extra kilometre
     */
    private BigDecimal extraKmRate;

    private Double currentLatitude;
    private Double currentLongitude;

    @Column(nullable = false)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();

        if (this.status == null) {
            this.status = VehicleStatus.AVAILABLE;
        }

        if (this.dailyKmLimit == null) {
            this.dailyKmLimit = 300;
        }

        if (this.extraKmRate == null) {
            this.extraKmRate = BigDecimal.valueOf(15);
        }
    }

    public enum FuelType {
        PETROL, DIESEL, ELECTRIC, HYBRID
    }

    public enum Transmission {
        MANUAL, AUTOMATIC
    }

    public enum VehicleStatus {
        AVAILABLE, BOOKED, MAINTENANCE, INACTIVE
    }
}