package com.zoomhopr.booking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String riderId;

    @Column(nullable = false)
    private String vehicleId;

    @Column(nullable = false)
    private Instant startTime;

    @Column(nullable = false)
    private Instant endTime;

    private Instant actualStartTime;
    private Instant actualEndTime;

    @Column(nullable = false)
    private BigDecimal estimatedFare;

    private BigDecimal finalFare;

    private Integer startOdometer;
    private Integer endOdometer;

    // Actual distance travelled
    private Integer distanceKm;

    // KM included in the booking
    private Integer allowedKm;

    // KM travelled above the allowed limit
    private Integer extraKm;

    // Price charged for each extra KM
    private BigDecimal extraKmRate;

    // Total charge for extra KM
    private BigDecimal extraKmCharge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();

        if (this.status == null) {
            this.status = BookingStatus.PENDING;
        }
    }

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        ONGOING,
        COMPLETED,
        CANCELLED
    }
}