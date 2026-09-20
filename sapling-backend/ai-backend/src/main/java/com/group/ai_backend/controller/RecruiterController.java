package com.group.ai_backend.controller;

import com.group.ai_backend.entity.Job;
import com.group.ai_backend.entity.Resume;
import com.group.ai_backend.entity.User;
import com.group.ai_backend.repository.JobRepository;
import com.group.ai_backend.repository.ResumeRepository;
import com.group.ai_backend.repository.UserRepository;
import com.group.ai_backend.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter")
public class RecruiterController {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final AiService aiService;

    public RecruiterController(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            AiService aiService) {

        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.aiService = aiService;
    }


    // =====================================================
    // GET ALL CANDIDATES
    // =====================================================

    @GetMapping("/candidates")
    public ResponseEntity<List<User>> getCandidates(
            Authentication authentication) {

        verifyRecruiter(authentication);

        List<User> candidates =
                userRepository.findAllCandidates();

        return ResponseEntity.ok(candidates);
    }


    // =====================================================
    // GET ALL CANDIDATE RESUMES
    // =====================================================

    @GetMapping("/candidate-resumes")
    public ResponseEntity<List<Resume>> getCandidateResumes(
            Authentication authentication) {

        verifyRecruiter(authentication);

        List<Resume> resumes =
                resumeRepository.findAllCandidateResumes();

        return ResponseEntity.ok(resumes);
    }


    // =====================================================
    // GET SINGLE CANDIDATE RESUME
    // =====================================================

    @GetMapping("/candidate-resumes/{resumeId}")
    public ResponseEntity<Resume> getCandidateResume(
            @PathVariable Long resumeId,
            Authentication authentication) {

        verifyRecruiter(authentication);

        Resume resume =
                resumeRepository
                        .findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );

        // -------------------------------------------------
        // MAKE SURE THIS IS A CANDIDATE RESUME
        // -------------------------------------------------

        if (resume.getUser() == null ||
                !"CANDIDATE".equalsIgnoreCase(
                        resume.getUser().getRole())) {

            throw new RuntimeException(
                    "This resume does not belong to a candidate"
            );
        }

        return ResponseEntity.ok(resume);
    }


    // =====================================================
    // GET RECRUITER'S JOBS
    // =====================================================

    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getMyJobs(
            Authentication authentication) {

        User recruiter =
                verifyRecruiter(authentication);

        List<Job> jobs =
                jobRepository.findByRecruiterEmail(
                        recruiter.getEmail()
                );

        return ResponseEntity.ok(jobs);
    }


    // =====================================================
    // AI MATCH RESUME WITH JOB
    // =====================================================

    @PostMapping("/match")
    public Flux<String> matchCandidateWithJob(
            @RequestParam Long jobId,
            @RequestParam Long resumeId,
            Authentication authentication) {

        User recruiter =
                verifyRecruiter(authentication);


        // -------------------------------------------------
        // CHECK JOB OWNERSHIP
        // -------------------------------------------------

        Job job =
                jobRepository
                        .findByIdAndRecruiterEmail(
                                jobId,
                                recruiter.getEmail()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found or access denied"
                                )
                        );


        // -------------------------------------------------
        // FIND RESUME
        // -------------------------------------------------

        Resume resume =
                resumeRepository
                        .findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );


        // -------------------------------------------------
        // CHECK RESUME BELONGS TO CANDIDATE
        // -------------------------------------------------

        if (resume.getUser() == null ||
                !"CANDIDATE".equalsIgnoreCase(
                        resume.getUser().getRole())) {

            throw new RuntimeException(
                    "Selected resume does not belong to a candidate"
            );
        }


        // -------------------------------------------------
        // AI MATCHING
        // -------------------------------------------------

        return aiService.matchResumeWithJob(
                resume.getResumeText(),
                job.getDescription()
        );
    }


    // =====================================================
    // VERIFY RECRUITER
    // =====================================================

    private User verifyRecruiter(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        String email =
                authentication.getName();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        if (!"RECRUITER".equalsIgnoreCase(
                user.getRole())) {

            throw new RuntimeException(
                    "Access denied. Recruiter only."
            );
        }

        return user;
    }
}