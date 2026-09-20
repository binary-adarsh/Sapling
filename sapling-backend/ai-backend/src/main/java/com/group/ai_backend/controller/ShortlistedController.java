package com.group.ai_backend.controller;

import com.group.ai_backend.entity.Resume;
import com.group.ai_backend.entity.ShortlistedCandidate;
import com.group.ai_backend.entity.User;
import com.group.ai_backend.repository.ResumeRepository;
import com.group.ai_backend.repository.ShortlistedCandidateRepository;
import com.group.ai_backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter/shortlisted")
public class ShortlistedController {

    private final ShortlistedCandidateRepository
            shortlistedRepository;

    private final ResumeRepository resumeRepository;

    private final UserRepository userRepository;


    public ShortlistedController(
            ShortlistedCandidateRepository shortlistedRepository,
            ResumeRepository resumeRepository,
            UserRepository userRepository) {

        this.shortlistedRepository =
                shortlistedRepository;

        this.resumeRepository =
                resumeRepository;

        this.userRepository =
                userRepository;
    }


    // =====================================================
    // SHORTLIST CANDIDATE
    // =====================================================

    @PostMapping("/{resumeId}")
    public ResponseEntity<?> shortlistCandidate(
            @PathVariable Long resumeId,
            Authentication authentication) {

        User recruiter =
                verifyRecruiter(authentication);


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
        // CHECK CANDIDATE
        // -------------------------------------------------

        if (resume.getUser() == null ||
                !"CANDIDATE".equalsIgnoreCase(
                        resume.getUser().getRole()
                )) {

            throw new RuntimeException(
                    "Selected resume does not belong to a candidate"
            );
        }


        // -------------------------------------------------
        // CHECK ALREADY SHORTLISTED
        // -------------------------------------------------

        if (shortlistedRepository
                .existsByRecruiterIdAndResumeId(
                        recruiter.getId(),
                        resumeId
                )) {

            return ResponseEntity.ok(
                    "Candidate is already shortlisted"
            );
        }


        // -------------------------------------------------
        // CREATE SHORTLIST
        // -------------------------------------------------

        ShortlistedCandidate shortlisted =
                new ShortlistedCandidate();

        shortlisted.setRecruiter(recruiter);
        shortlisted.setResume(resume);

        shortlistedRepository.save(shortlisted);


        return ResponseEntity.ok(
                "Candidate shortlisted successfully"
        );
    }


    // =====================================================
    // GET SHORTLISTED CANDIDATES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ShortlistedCandidate>>
    getShortlistedCandidates(
            Authentication authentication) {

        User recruiter =
                verifyRecruiter(authentication);


        List<ShortlistedCandidate> shortlisted =
                shortlistedRepository
                        .findByRecruiterId(
                                recruiter.getId()
                        );


        return ResponseEntity.ok(shortlisted);
    }


    // =====================================================
    // CHECK SHORTLIST STATUS
    // =====================================================

    @GetMapping("/check/{resumeId}")
    public ResponseEntity<Boolean> checkShortlisted(
            @PathVariable Long resumeId,
            Authentication authentication) {

        User recruiter =
                verifyRecruiter(authentication);


        boolean shortlisted =
                shortlistedRepository
                        .existsByRecruiterIdAndResumeId(
                                recruiter.getId(),
                                resumeId
                        );


        return ResponseEntity.ok(shortlisted);
    }


    // =====================================================
    // REMOVE FROM SHORTLIST
    // =====================================================

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<?> removeFromShortlist(
            @PathVariable Long resumeId,
            Authentication authentication) {

        User recruiter =
                verifyRecruiter(authentication);


        boolean exists =
                shortlistedRepository
                        .existsByRecruiterIdAndResumeId(
                                recruiter.getId(),
                                resumeId
                        );


        if (!exists) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Candidate is not shortlisted"
                    );
        }


        shortlistedRepository
                .deleteByRecruiterIdAndResumeId(
                        recruiter.getId(),
                        resumeId
                );


        return ResponseEntity.ok(
                "Candidate removed from shortlist"
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
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        if (!"RECRUITER".equalsIgnoreCase(
                user.getRole()
        )) {

            throw new RuntimeException(
                    "Access denied. Recruiter only."
            );
        }


        return user;
    }
}