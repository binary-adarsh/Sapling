package com.group.ai_backend.controller;

import com.group.ai_backend.dto.ResumeMatchRequest;
import com.group.ai_backend.dto.ResumeQuestionRequest;
import com.group.ai_backend.entity.JobMatch;
import com.group.ai_backend.entity.Resume;
import com.group.ai_backend.repository.JobMatchRepository;
import com.group.ai_backend.service.AiService;
import com.group.ai_backend.service.ResumeRagService;
import com.group.ai_backend.service.ResumeService;
import com.group.ai_backend.service.ResumeVectorService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final ResumeService resumeService;
    private final JobMatchRepository jobMatchRepository;
    private final ResumeVectorService resumeVectorService;
    private final ResumeRagService resumeRagService;

    public AiController(
            AiService aiService,
            ResumeService resumeService,
            JobMatchRepository jobMatchRepository,
            ResumeVectorService resumeVectorService,
            ResumeRagService resumeRagService) {

        this.aiService = aiService;
        this.resumeService = resumeService;
        this.jobMatchRepository = jobMatchRepository;
        this.resumeVectorService = resumeVectorService;
        this.resumeRagService = resumeRagService;
    }

    // =====================================================
    // 1. RESUME ANALYSIS + RAG VECTOR STORAGE
    // =====================================================

    @PostMapping("/analyze-resume")
    public Flux<String> analyzeResume(
            @RequestParam("file") MultipartFile file) {

        try {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            String email = authentication.getName();

            String resumeText =
                    resumeService.extractText(file);

            StringBuilder completeAnalysis =
                    new StringBuilder();

            return aiService
                    .analyzeResume(resumeText)

                    .doOnNext(completeAnalysis::append)

                    .doOnComplete(() -> {

                        Resume savedResume =
                                resumeService.saveResume(
                                        file,
                                        resumeText,
                                        completeAnalysis.toString(),
                                        email
                                );

                        resumeVectorService.storeResume(
                                savedResume.getId(),
                                resumeText,
                                email
                        );
                    });

        } catch (Exception e) {

            return Flux.just(
                    "Error: " + e.getMessage()
            );
        }
    }

    // =====================================================
    // 2. RESUME - JOB DESCRIPTION MATCHING
    // =====================================================

    @PostMapping("/match-resume")
    public Flux<String> matchResume(
            @RequestBody ResumeMatchRequest request) {

        try {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            String email =
                    authentication.getName();

            Resume resume =
                    resumeService.getMyResumeById(
                            request.getResumeId(),
                            email
                    );

            StringBuilder completeAnalysis =
                    new StringBuilder();

            return aiService
                    .matchResumeWithJob(
                            resume.getResumeText(),
                            request.getJobDescription()
                    )

                    .doOnNext(completeAnalysis::append)

                    .doOnComplete(() -> {

                        resumeService.saveJobMatch(
                                resume,
                                request.getJobDescription(),
                                completeAnalysis.toString(),
                                email
                        );
                    });

        } catch (Exception e) {

            return Flux.just(
                    "Error: " + e.getMessage()
            );
        }
    }

    // =====================================================
    // 3. GET ALL MY JOB MATCHES
    // =====================================================

    @GetMapping("/matches")
    public ResponseEntity<List<JobMatch>> getMyMatches(
            Authentication authentication) {

        String email =
                authentication.getName();

        List<JobMatch> matches =
                jobMatchRepository
                        .findByUserEmail(email);

        return ResponseEntity.ok(matches);
    }

    // =====================================================
    // 4. GET ONE JOB MATCH
    // =====================================================

    @GetMapping("/matches/{id}")
    public ResponseEntity<JobMatch> getMatchById(
            @PathVariable Long id,
            Authentication authentication) {

        String email =
                authentication.getName();

        JobMatch match =
                jobMatchRepository
                        .findByIdAndUserEmail(
                                id,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Match not found with id: "
                                                + id
                                )
                        );

        return ResponseEntity.ok(match);
    }

    // =====================================================
    // 5. DELETE ONE JOB MATCH
    // =====================================================

    @DeleteMapping("/matches/{id}")
    public ResponseEntity<String> deleteMatch(
            @PathVariable Long id,
            Authentication authentication) {

        String email =
                authentication.getName();

        JobMatch match =
                jobMatchRepository
                        .findByIdAndUserEmail(
                                id,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Match not found with id: "
                                                + id
                                )
                        );

        jobMatchRepository.delete(match);

        return ResponseEntity.ok(
                "Job match deleted successfully"
        );
    }

    // =====================================================
    // 6. ASK QUESTION FROM SPECIFIC RESUME
    // =====================================================

    @PostMapping("/ask-resume")
    public ResponseEntity<String> askResume(
            @RequestBody ResumeQuestionRequest request,
            Authentication authentication) {

        String email =
                authentication.getName();

        // ---------------------------------------------
        // Verify that resume belongs to logged-in user
        // ---------------------------------------------

        resumeService.getMyResumeById(
                request.getResumeId(),
                email
        );

        // ---------------------------------------------
        // Ask RAG question
        // ---------------------------------------------

        String answer =
                resumeRagService.askQuestion(
                        request.getQuestion(),
                        email,
                        request.getResumeId()
                );

        return ResponseEntity.ok(answer);
    }
}