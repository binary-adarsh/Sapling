package com.group.ai_backend.controller;

import com.group.ai_backend.dto.RecruiterApplicationResultDTO;
import com.group.ai_backend.entity.JobApplication;
import com.group.ai_backend.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(
            JobApplicationService applicationService
    ) {

        this.applicationService =
                applicationService;
    }

    // =====================================================
    // APPLY
    // =====================================================

    @PostMapping("/apply")
    public ResponseEntity<JobApplication> apply(
            @RequestParam Long jobId,
            @RequestParam Long resumeId,
            Authentication authentication
    ) {

        String email =
                authentication.getName();

        JobApplication application =
                applicationService.applyForJob(
                        jobId,
                        resumeId,
                        email
                );

        return ResponseEntity.ok(
                application
        );
    }

    // =====================================================
    // MY APPLICATIONS
    // =====================================================

    @GetMapping("/my")
    public ResponseEntity<List<JobApplication>>
    getMyApplications(
            Authentication authentication
    ) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                applicationService
                        .getMyApplications(email)
        );
    }

    // =====================================================
    // CHECK APPLICATION
    // =====================================================

    @GetMapping("/check/{jobId}")
    public ResponseEntity<Boolean> checkApplication(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                applicationService
                        .hasApplied(
                                jobId,
                                email
                        )
        );
    }

    // =====================================================
    // RECRUITER
    // GET CANDIDATES FOR JOB
    // =====================================================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<JobApplication>>
    getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        String recruiterEmail =
                authentication.getName();

        return ResponseEntity.ok(
                applicationService
                        .getJobApplications(
                                jobId,
                                recruiterEmail
                        )
        );
    }

    // =====================================================
    // RECRUITER
    // GET APPLICATION RESULTS
    // =====================================================

    @GetMapping("/job/{jobId}/results")
    public ResponseEntity<
            List<RecruiterApplicationResultDTO>>
    getRecruiterApplicationResults(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        String recruiterEmail =
                authentication.getName();

        return ResponseEntity.ok(
                applicationService
                        .getRecruiterApplicationResults(
                                jobId,
                                recruiterEmail
                        )
        );
    }
}