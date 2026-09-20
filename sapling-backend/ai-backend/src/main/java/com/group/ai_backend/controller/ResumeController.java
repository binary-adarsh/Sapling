package com.group.ai_backend.controller;

import com.group.ai_backend.dto.ResumeStatsResponse;
import com.group.ai_backend.entity.Resume;
import com.group.ai_backend.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // Resume upload + PDF text extraction
    @PostMapping("/upload")
    public ResponseEntity<String> uploadResume(
            @RequestParam("file") MultipartFile file) {

        try {

            String text =
                    resumeService.extractText(file);

            return ResponseEntity.ok(text);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // Logged-in user ke sirf apne resumes
    @GetMapping
    public ResponseEntity<List<Resume>> getMyResumes(
            Authentication authentication) {

        String email = authentication.getName();

        List<Resume> resumes =
                resumeService.getMyResumes(email);

        return ResponseEntity.ok(resumes);
    }

    // Sirf apna resume ID se access
    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResumeById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        Resume resume =
                resumeService.getMyResumeById(id, email);

        return ResponseEntity.ok(resume);
    }

    // Sirf apna resume delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResume(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        resumeService.deleteMyResume(id, email);

        return ResponseEntity.ok(
                "Resume deleted successfully"
        );
    }

    // Resume statistics
    @GetMapping("/stats")
    public ResponseEntity<ResumeStatsResponse> getMyResumeStats(
            Authentication authentication) {

        String email = authentication.getName();

        ResumeStatsResponse stats =
                resumeService.getMyResumeStats(email);

        return ResponseEntity.ok(stats);
    }
}