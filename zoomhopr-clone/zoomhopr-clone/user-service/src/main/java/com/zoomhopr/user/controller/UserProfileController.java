package com.zoomhopr.user.controller;

import com.zoomhopr.user.dto.ProfileUpdateRequest;
import com.zoomhopr.user.entity.UserProfile;
import com.zoomhopr.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService service;

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfile> getProfile(@PathVariable String userId) {
        return ResponseEntity.ok(service.getProfile(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfile> updateProfile(
            @PathVariable String userId, @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(service.updateProfile(userId, request));
    }
}
