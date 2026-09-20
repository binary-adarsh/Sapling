package com.group.ai_backend.repository;

import com.group.ai_backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {

    // =====================================================
    // CANDIDATE APPLICATIONS
    // =====================================================

    List<JobApplication> findByCandidateEmail(
            String email
    );

    // =====================================================
    // CHECK DUPLICATE APPLICATION
    // =====================================================

    Optional<JobApplication>
    findByJobIdAndCandidateEmail(
            Long jobId,
            String email
    );

    // =====================================================
    // GET APPLICATION BY ID + CANDIDATE
    // =====================================================

    Optional<JobApplication>
    findByIdAndCandidateEmail(
            Long id,
            String email
    );

    // =====================================================
    // RECRUITER - JOB APPLICATIONS
    // =====================================================

    List<JobApplication> findByJobId(
            Long jobId
    );
}