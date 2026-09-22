package com.zoomhopr.auth.service;

import com.zoomhopr.auth.dto.AuthResponse;
import com.zoomhopr.auth.dto.LoginRequest;
import com.zoomhopr.auth.dto.RegisterRequest;
import com.zoomhopr.auth.entity.User;
import com.zoomhopr.auth.exception.AuthException;
import com.zoomhopr.auth.repository.UserRepository;
import com.zoomhopr.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new AuthException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(User.Role.valueOf(request.role().toUpperCase()))
                .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new AuthException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        String userId = jwtUtil.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found", HttpStatus.UNAUTHORIZED));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        return new AuthResponse(user.getId(), user.getEmail(), user.getRole().name(), accessToken, refreshToken);
    }
}
