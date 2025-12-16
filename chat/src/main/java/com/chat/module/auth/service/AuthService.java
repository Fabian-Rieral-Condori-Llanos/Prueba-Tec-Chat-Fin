package com.chat.module.auth.service;

import com.chat.config.JwtConfig;
import com.chat.model.mongo.UserSession;
import com.chat.model.postgres.User;
import com.chat.module.auth.dto.*;
import com.chat.module.auth.repository.UserRepository;
import com.chat.module.auth.repository.UserSessionMongoRepository;
import com.chat.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserSessionMongoRepository userSessionMongoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final JwtConfig jwtConfig;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProfilePictureUrl(request.getProfilePictureUrl());
        user.setStatus(User.UserStatus.OFFLINE);
        user.setIsActive(true);

        user = userRepository.save(user);

        String accessToken = tokenProvider.generateToken(user.getUsername());
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());

        log.info("User registered successfully: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .expiresIn(jwtConfig.getExpiration() / 1000) // Convertir a segundos
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("User attempting to login: {}", request.getUsernameOrEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(),
                request.getUsernameOrEmail()
        ).orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(User.UserStatus.ONLINE);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);

        if (request.getDeviceId() != null) {
            createUserSession(user.getId(), request);
        }

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());

        log.info("User logged in successfully: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .expiresIn(jwtConfig.getExpiration() / 1000)
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = tokenProvider.generateToken(username);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .expiresIn(jwtConfig.getExpiration() / 1000)
                .build();
    }

    @Transactional
    public void logout(Long userId, String deviceId) {
        log.info("User logging out: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus(User.UserStatus.OFFLINE);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);

        if (deviceId != null) {
            userSessionMongoRepository.deleteByUserIdAndDeviceId(userId, deviceId);
        } else {
            userSessionMongoRepository.deleteByUserId(userId);
        }

        log.info("User logged out successfully: {}", userId);
    }

    private void createUserSession(Long userId, LoginRequest request) {
        UserSession session = new UserSession();
        session.setUserId(userId);
        session.setDeviceId(request.getDeviceId());
        session.setDeviceType(request.getDeviceType());
        session.setFcmToken(request.getFcmToken());
        session.setLastActivity(LocalDateTime.now());
        session.setIsActive(true);

        userSessionMongoRepository.save(session);
        log.info("User session created for device: {}", request.getDeviceId());
    }
}
