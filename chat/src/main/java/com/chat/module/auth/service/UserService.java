package com.chat.module.auth.service;

import com.chat.model.postgres.User;
import com.chat.module.auth.dto.ChangePasswordRequest;
import com.chat.module.auth.dto.UpdateProfileRequest;
import com.chat.module.auth.dto.UserResponse;
import com.chat.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return UserResponse.fromUser(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return UserResponse.fromUser(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(String searchTerm) {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(searchTerm.toLowerCase()) ||
                                user.getEmail().toLowerCase().contains(searchTerm.toLowerCase()))
                .limit(20)
                .collect(Collectors.toList());
        
        return users.stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }

        user = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", userId);

        return UserResponse.fromUser(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", userId);
    }

    @Transactional
    public void updateUserStatus(Long userId, User.UserStatus status) {
        userRepository.updateUserStatus(userId, status, LocalDateTime.now());
        log.info("User status updated to {} for user: {}", status, userId);
    }

    @Transactional
    public void updateProfilePicture(Long userId, String pictureUrl) {
        userRepository.updateProfilePicture(userId, pictureUrl);
        log.info("Profile picture updated for user: {}", userId);
    }

    @Transactional
    public void deactivateAccount(Long userId) {
        log.info("Deactivating account for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(false);
        user.setStatus(User.UserStatus.OFFLINE);
        userRepository.save(user);

        log.info("Account deactivated for user: {}", userId);
    }
}