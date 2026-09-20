package com.group.ai_backend.controller;

import com.group.ai_backend.dto.CodingResultDTO;
import com.group.ai_backend.entity.CodingQuestion;
import com.group.ai_backend.entity.CodingSession;
import com.group.ai_backend.entity.CodingSubmission;
import com.group.ai_backend.service.CodingService;
import com.group.ai_backend.service.CodingSessionService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coding/session")
public class CodingSessionController {

    private final CodingSessionService codingSessionService;
    private final CodingService codingService;

    public CodingSessionController(
            CodingSessionService codingSessionService,
            CodingService codingService) {

        this.codingSessionService =
                codingSessionService;

        this.codingService =
                codingService;
    }

    // =====================================================
    // START CODING SESSION
    // =====================================================

    @PostMapping("/start")
    public ResponseEntity<CodingSession> startSession(
            @RequestParam Long applicationId,
            Authentication authentication) {

        String email =
                authentication.getName();

        CodingSession session =
                codingSessionService.startSession(
                        applicationId,
                        email
                );

        return ResponseEntity.ok(session);
    }

    // =====================================================
    // GET CURRENT QUESTION
    // =====================================================

    @GetMapping("/{sessionId}/question")
    public ResponseEntity<CodingQuestion> getCurrentQuestion(
            @PathVariable Long sessionId,
            Authentication authentication) {

        String email =
                authentication.getName();

        CodingQuestion question =
                codingSessionService.getCurrentQuestion(
                        sessionId,
                        email
                );

        return ResponseEntity.ok(question);
    }

    // =====================================================
    // SUBMIT CODE
    // =====================================================

    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<CodingSubmission> submitCode(
            @PathVariable Long sessionId,
            @RequestParam String code,
            Authentication authentication) {

        String email =
                authentication.getName();

        CodingSubmission submission =
                codingService.submitCodeForSession(
                        sessionId,
                        code,
                        email
                );

        return ResponseEntity.ok(
                submission
        );
    }

    // =====================================================
    // FINAL RESULT
    // =====================================================

    @GetMapping("/{sessionId}/result")
    public ResponseEntity<CodingResultDTO> getSessionResult(
            @PathVariable Long sessionId,
            Authentication authentication) {

        String email =
                authentication.getName();

        CodingResultDTO result =
                codingSessionService.getSessionResult(
                        sessionId,
                        email
                );

        return ResponseEntity.ok(
                result
        );
    }}
