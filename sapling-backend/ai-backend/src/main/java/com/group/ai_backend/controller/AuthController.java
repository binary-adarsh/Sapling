package com.group.ai_backend.controller;

import com.group.ai_backend.dto.ChangePasswordRequest;
import com.group.ai_backend.dto.LoginRequest;
import com.group.ai_backend.dto.LoginResponse;
import com.group.ai_backend.dto.RegisterRequest;
import com.group.ai_backend.entity.User;
import com.group.ai_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =====================================================
    // REGISTER
    // =====================================================

    @PostMapping("/register")
    public User register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        String token = authService.login(request);

        return new LoginResponse(token);
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        try {

            // JWT se logged-in user's email
            String email = authentication.getName();

            authService.changePassword(
                    email,
                    request
            );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Password changed successfully"
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    false
            );

            response.put(
                    "message",
                    e.getMessage()
            );

            return ResponseEntity
                    .badRequest()
                    .body(response);
        }
    }
}