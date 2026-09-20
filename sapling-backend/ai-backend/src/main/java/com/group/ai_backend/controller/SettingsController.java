package com.group.ai_backend.controller;

import com.group.ai_backend.dto.ChangePasswordRequest;
import com.group.ai_backend.entity.User;
import com.group.ai_backend.repository.UserRepository;
import com.group.ai_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public SettingsController(
            AuthService authService,
            UserRepository userRepository) {

        this.authService = authService;
        this.userRepository = userRepository;
    }

    // =========================
    // GET PROFILE
    // =========================

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            Authentication authentication) {

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        return ResponseEntity.ok(
                new ProfileResponse(
                        user.getName(),
                        user.getEmail(),
                        user.getRole()
                )
        );
    }

    // =========================
    // CHANGE PASSWORD
    // =========================

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        String email =
                authentication.getName();

        try {

            authService.changePassword(
                    email,
                    request
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Password changed successfully"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================
    // PROFILE RESPONSE
    // =========================

    public record ProfileResponse(
            String name,
            String email,
            String role
    ) {}

    // =========================
    // MESSAGE RESPONSE
    // =========================

    public record MessageResponse(
            String message
    ) {}
}