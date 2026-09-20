package com.group.ai_backend.service;

import com.group.ai_backend.entity.Resume;
import com.group.ai_backend.entity.ShortlistedCandidate;
import com.group.ai_backend.entity.User;
import com.group.ai_backend.repository.ResumeRepository;
import com.group.ai_backend.repository.ShortlistedCandidateRepository;
import com.group.ai_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShortlistedCandidateService {

    private final ShortlistedCandidateRepository shortlistedRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    public ShortlistedCandidateService(
            ShortlistedCandidateRepository shortlistedRepository,
            UserRepository userRepository,
            ResumeRepository resumeRepository) {

        this.shortlistedRepository = shortlistedRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
    }


    // =====================================================
    // SHORTLIST CANDIDATE
    // =====================================================

    public ShortlistedCandidate shortlistCandidate(
            Long resumeId,
            String recruiterEmail) {

        // Find recruiter
        User recruiter =
                userRepository.findByEmail(recruiterEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recruiter not found"
                                )
                        );


        // Check recruiter role
        if (!"RECRUITER".equalsIgnoreCase(
                recruiter.getRole())) {

            throw new RuntimeException(
                    "Only recruiters can shortlist candidates"
            );
        }


        // Find resume
        Resume resume =
                resumeRepository.findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );


        // Check if already shortlisted
        if (shortlistedRepository
                .existsByRecruiterIdAndResumeId(
                        recruiter.getId(),
                        resumeId
                )) {

            throw new RuntimeException(
                    "Candidate is already shortlisted"
            );
        }


        // Create shortlist
        ShortlistedCandidate shortlisted =
                new ShortlistedCandidate();

        shortlisted.setRecruiter(recruiter);
        shortlisted.setResume(resume);


        return shortlistedRepository.save(
                shortlisted
        );
    }


    // =====================================================
    // GET SHORTLISTED CANDIDATES
    // =====================================================

    public List<ShortlistedCandidate>
    getShortlistedCandidates(
            String recruiterEmail) {

        User recruiter =
                userRepository.findByEmail(recruiterEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recruiter not found"
                                )
                        );


        return shortlistedRepository
                .findByRecruiterId(
                        recruiter.getId()
                );
    }


    // =====================================================
    // CHECK SHORTLISTED
    // =====================================================

    public boolean isShortlisted(
            Long resumeId,
            String recruiterEmail) {

        User recruiter =
                userRepository.findByEmail(recruiterEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recruiter not found"
                                )
                        );


        return shortlistedRepository
                .existsByRecruiterIdAndResumeId(
                        recruiter.getId(),
                        resumeId
                );
    }


    // =====================================================
    // REMOVE FROM SHORTLIST
    // =====================================================

    public void removeFromShortlist(
            Long resumeId,
            String recruiterEmail) {

        User recruiter =
                userRepository.findByEmail(recruiterEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recruiter not found"
                                )
                        );


        boolean exists =
                shortlistedRepository
                        .existsByRecruiterIdAndResumeId(
                                recruiter.getId(),
                                resumeId
                        );


        if (!exists) {

            throw new RuntimeException(
                    "Candidate is not shortlisted"
            );
        }


        shortlistedRepository
                .deleteByRecruiterIdAndResumeId(
                        recruiter.getId(),
                        resumeId
                );
    }
}