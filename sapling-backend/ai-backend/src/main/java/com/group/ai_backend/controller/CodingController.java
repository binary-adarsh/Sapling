package com.group.ai_backend.controller;

import com.group.ai_backend.entity.CodingQuestion;
import com.group.ai_backend.entity.CodingSubmission;
import com.group.ai_backend.service.CodingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding")
public class CodingController {

    private final CodingService codingService;

    public CodingController(
            CodingService codingService) {

        this.codingService = codingService;
    }


    // =====================================================
    // GET RANDOM 3 QUESTIONS
    // =====================================================

    @GetMapping("/questions")
    public ResponseEntity<List<CodingQuestion>> getQuestions() {

        List<CodingQuestion> questions =
                codingService.getRandomQuestions();

        return ResponseEntity.ok(questions);
    }


    // =====================================================
    // OLD SUBMIT CODE
    // =====================================================

    @PostMapping("/submit")
    public ResponseEntity<CodingSubmission> submitCode(
            @RequestParam Long questionId,
            @RequestParam String code,
            Authentication authentication) {

        String email =
                authentication.getName();

        CodingSubmission submission =
                codingService.submitCode(
                        questionId,
                        code,
                        email
                );

        return ResponseEntity.ok(submission);
    }
}