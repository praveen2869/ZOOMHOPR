package com.zoomhopr.user.service;

import com.zoomhopr.user.dto.ProfileUpdateRequest;
import com.zoomhopr.user.entity.UserProfile;
import com.zoomhopr.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository repository;

    public UserProfile getProfile(String userId) {
        return repository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Profile not found: " + userId));
    }

    public UserProfile updateProfile(String userId, ProfileUpdateRequest request) {
        UserProfile profile = repository.findById(userId)
                .orElse(UserProfile.builder().userId(userId).build());

        if (request.fullName() != null) profile.setFullName(request.fullName());
        if (request.profileImageUrl() != null) profile.setProfileImageUrl(request.profileImageUrl());
        if (request.licenseNumber() != null) profile.setLicenseNumber(request.licenseNumber());
        if (request.licenseImageUrl() != null) profile.setLicenseImageUrl(request.licenseImageUrl());

        return repository.save(profile);
    }
}
