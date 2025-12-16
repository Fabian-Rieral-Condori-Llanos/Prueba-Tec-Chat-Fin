package com.chat.module.auth.controller;

import com.chat.model.postgres.User;
import com.chat.module.auth.dto.ChangePasswordRequest;
import com.chat.module.auth.dto.UpdateProfileRequest;
import com.chat.module.auth.dto.UserResponse;
import com.chat.module.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;

    /**
     * Obtiene el perfil del usuario autenticado
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Getting current user profile: {}", username);
        
        UserResponse response = userService.getUserByUsername(username);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene un usuario por ID
     * GET /api/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        log.info("Getting user by id: {}", userId);
        
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene un usuario por username
     * GET /api/users/username/{username}
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
        log.info("Getting user by username: {}", username);
        
        UserResponse response = userService.getUserByUsername(username);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca usuarios por término de búsqueda
     * GET /api/users/search?q=searchTerm
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String q) {
        log.info("Searching users with term: {}", q);
        
        List<UserResponse> users = userService.searchUsers(q);
        return ResponseEntity.ok(users);
    }

    /**
     * Actualiza el perfil del usuario autenticado
     * PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Updating profile for user: {}", username);
        
        // Obtener el ID del usuario autenticado
        UserResponse currentUser = userService.getUserByUsername(username);
        UserResponse response = userService.updateProfile(currentUser.getId(), request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Cambia la contraseña del usuario autenticado
     * PUT /api/users/me/password
     */
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Changing password for user: {}", username);
        
        // Obtener el ID del usuario autenticado
        UserResponse currentUser = userService.getUserByUsername(username);
        userService.changePassword(currentUser.getId(), request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Actualiza el estado del usuario (ONLINE, OFFLINE, AWAY)
     * PATCH /api/users/me/status
     */
    @PatchMapping("/me/status")
    public ResponseEntity<Map<String, String>> updateStatus(
            @RequestParam String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Updating status for user: {} to {}", username, status);
        
        try {
            User.UserStatus userStatus = User.UserStatus.valueOf(status.toUpperCase());
            UserResponse currentUser = userService.getUserByUsername(username);
            userService.updateUserStatus(currentUser.getId(), userStatus);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Status updated successfully");
            response.put("status", status);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status. Valid values are: ONLINE, OFFLINE, AWAY");
        }
    }

    /**
     * Actualiza la foto de perfil del usuario
     * PATCH /api/users/me/profile-picture
     */
    @PatchMapping("/me/profile-picture")
    public ResponseEntity<Map<String, String>> updateProfilePicture(
            @RequestParam String pictureUrl) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Updating profile picture for user: {}", username);
        
        UserResponse currentUser = userService.getUserByUsername(username);
        userService.updateProfilePicture(currentUser.getId(), pictureUrl);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile picture updated successfully");
        response.put("pictureUrl", pictureUrl);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Desactiva la cuenta del usuario autenticado
     * DELETE /api/users/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deactivateAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        log.info("Deactivating account for user: {}", username);
        
        UserResponse currentUser = userService.getUserByUsername(username);
        userService.deactivateAccount(currentUser.getId());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Account deactivated successfully");
        
        return ResponseEntity.ok(response);
    }
}