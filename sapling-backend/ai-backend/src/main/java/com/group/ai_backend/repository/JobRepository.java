package com.group.ai_backend.repository;

import com.group.ai_backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByRecruiterEmail(String email);

    Optional<Job> findByIdAndRecruiterEmail(
            Long id,
            String email
    );

    // =========================
    // ACTIVE JOBS FOR CANDIDATES
    // =========================

    List<Job> findByActiveTrue();
}