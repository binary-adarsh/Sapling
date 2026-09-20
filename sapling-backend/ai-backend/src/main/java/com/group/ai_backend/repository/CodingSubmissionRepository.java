package com.group.ai_backend.repository;

import com.group.ai_backend.entity.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodingSubmissionRepository
        extends JpaRepository<CodingSubmission, Long> {

    List<CodingSubmission> findByUserEmail(String email);

    List<CodingSubmission> findByUserEmailAndQuestionId(
            String email,
            Long questionId
    );

    List<CodingSubmission> findBySessionId(Long sessionId);
}