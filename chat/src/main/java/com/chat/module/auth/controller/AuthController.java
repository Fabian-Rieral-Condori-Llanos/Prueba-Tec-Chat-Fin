package com.chat.module.auth.controller;

import com.chat.module.auth.dto.*;
import com.chat.module.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint para registrar un nuevo usuario
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request received for username: {}", request.getUsername());
        
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error during registration: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Endpoint para iniciar sesión
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for: {}", request.getUsernameOrEmail());
        
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during login: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Endpoint para refrescar el access token
     * POST /api/auth/refresh-token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Refresh token request received");
        
        try {
            AuthResponse response = authService.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during token refresh: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Endpoint para cerrar sesión
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestParam Long userId,
            @RequestParam(required = false) String deviceId) {
        log.info("Logout request received for user: {}", userId);
        
        try {
            authService.logout(userId, deviceId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logged out successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during logout: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Endpoint para verificar si el token es válido
     * GET /api/auth/validate-token
     */
    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, Boolean>> validateToken(
            @RequestHeader("Authorization") String authHeader) {
        log.info("Token validation request received");
        
        Map<String, Boolean> response = new HashMap<>();
        
        try {
            // El filtro JWT ya validó el token si llegamos aquí
            response.put("valid", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("valid", false);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Endpoint de prueba para verificar que el servidor está funcionando
     * GET /api/auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Auth service is running");
        return ResponseEntity.ok(response);
    }
}