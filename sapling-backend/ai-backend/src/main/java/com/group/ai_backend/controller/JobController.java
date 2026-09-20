package com.group.ai_backend.controller;

import com.group.ai_backend.dto.JobRequest;
import com.group.ai_backend.entity.Job;
import com.group.ai_backend.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(
            JobService jobService) {

        this.jobService = jobService;
    }


    // =========================
    // CREATE JOB
    // =========================

    @PostMapping
    public ResponseEntity<Job> createJob(
            @RequestBody JobRequest request,
            Authentication authentication) {

        String email =
                authentication.getName();

        Job job =
                jobService.createJob(
                        request,
                        email
                );

        return ResponseEntity.ok(job);
    }


    // =========================
    // GET MY JOBS
    // =========================

    @GetMapping
    public ResponseEntity<List<Job>> getMyJobs(
            Authentication authentication) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                jobService.getMyJobs(email)
        );
    }


    // =========================
    // GET ONE JOB
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Job> getMyJob(
            @PathVariable Long id,
            Authentication authentication) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                jobService.getMyJob(
                        id,
                        email
                )
        );
    }


    // =========================
    // UPDATE JOB
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody JobRequest request,
            Authentication authentication) {

        String email =
                authentication.getName();

        Job updatedJob =
                jobService.updateMyJob(
                        id,
                        request,
                        email
                );

        return ResponseEntity.ok(
                updatedJob
        );
    }


    // =========================
    // TOGGLE JOB STATUS
    // =========================

    @PatchMapping("/{id}/status")
    public ResponseEntity<Job> toggleJobStatus(
            @PathVariable Long id,
            Authentication authentication) {

        String email =
                authentication.getName();

        Job updatedJob =
                jobService.toggleJobStatus(
                        id,
                        email
                );

        return ResponseEntity.ok(
                updatedJob
        );
    }


    // =========================
    // DELETE JOB
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id,
            Authentication authentication) {

        String email =
                authentication.getName();

        jobService.deleteMyJob(
                id,
                email
        );

        return ResponseEntity.ok(
                "Job deleted successfully"
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<Job>> getActiveJobs() {

        return ResponseEntity.ok(
                jobService.getActiveJobs()
        );
    }
}