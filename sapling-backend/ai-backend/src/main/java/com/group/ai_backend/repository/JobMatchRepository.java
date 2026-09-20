package com.group.ai_backend.repository;

import com.group.ai_backend.entity.JobMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobMatchRepository
        extends JpaRepository<JobMatch, Long> {

    List<JobMatch> findByUserEmail(String email);

    List<JobMatch> findByResumeIdAndUserEmail(
            Long resumeId,
            String email
    );
    Optional<JobMatch> findByIdAndUserEmail(Long id, String email);
}