package com.zoomhopr.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transactions")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    private String bookingId; // nullable: also used for wallet top-ups

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // BOOKING_CHARGE, REFUND, WALLET_TOPUP, PAYOUT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status; // PENDING, SUCCESS, FAILED

    // Ensures a gateway webhook retry never double-charges the same event.
    @Column(nullable = false, unique = true)
    private String idempotencyKey;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = TransactionStatus.PENDING;
    }

    public enum TransactionType { BOOKING_CHARGE, REFUND, WALLET_TOPUP, PAYOUT }
    public enum TransactionStatus { PENDING, SUCCESS, FAILED }
}
