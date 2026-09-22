package com.zoomhopr.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "user_profiles")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserProfile {

    @Id
    private String userId; // same id as auth-service's User.id

    private String fullName;
    private String email;
    private String phone;
    private String profileImageUrl;
    private String licenseNumber;
    private String licenseImageUrl;

    private Double averageRating;
    private Integer totalTrips;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (this.averageRating == null) this.averageRating = 0.0;
        if (this.totalTrips == null) this.totalTrips = 0;
    }
}
