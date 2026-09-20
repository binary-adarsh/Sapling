package com.group.ai_backend.repository;

import com.group.ai_backend.entity.CodingSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodingSessionRepository
        extends JpaRepository<CodingSession, Long> {

    // ==========================================
    // FIND SESSION OF CANDIDATE
    // ==========================================

    Optional<CodingSession> findByIdAndUserEmail(
            Long id,
            String email
    );

    // ==========================================
    // FIND SESSIONS OF APPLICATION
    // ==========================================

    List<CodingSession> findByApplicationId(
            Long applicationId
    );

    // ==========================================
    // SECURE SESSION ACCESS
    // ==========================================

    Optional<CodingSession>
    findByIdAndApplicationCandidateEmail(
            Long id,
            String email
    );
}