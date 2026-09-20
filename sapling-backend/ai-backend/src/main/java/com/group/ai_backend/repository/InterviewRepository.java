package com.group.ai_backend.repository;

import com.group.ai_backend.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    // ==========================================
    // CANDIDATE INTERVIEWS
    // ==========================================

    List<Interview> findByResumeUserEmail(
            String email
    );

    // ==========================================
    // SECURE INTERVIEW ACCESS
    // ==========================================

    Optional<Interview> findByIdAndResumeUserEmail(
            Long id,
            String email
    );

    // ==========================================
    // APPLICATION INTERVIEWS
    // ==========================================

    List<Interview> findByApplicationId(
            Long applicationId
    );

    // ==========================================
    // SECURE APPLICATION INTERVIEW ACCESS
    // ==========================================

    Optional<Interview> findByIdAndApplicationCandidateEmail(
            Long id,
            String email
    );
}