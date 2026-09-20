package com.group.ai_backend.repository;

import com.group.ai_backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    // =========================
    // USER'S OWN RESUMES
    // =========================

    List<Resume> findByUserEmail(String email);

    Optional<Resume> findByIdAndUserEmail(
            Long id,
            String email
    );


    // =========================
    // RESUME STATISTICS
    // =========================

    long countByUserEmail(String email);

    @Query("""
        SELECT AVG(r.score)
        FROM Resume r
        WHERE r.user.email = :email
    """)
    Double findAverageScoreByUserEmail(
            @Param("email") String email
    );

    @Query("""
        SELECT MAX(r.score)
        FROM Resume r
        WHERE r.user.email = :email
    """)
    Double findMaxScoreByUserEmail(
            @Param("email") String email
    );


    // =========================
    // RECRUITER
    // GET ALL CANDIDATE RESUMES
    // =========================

    @Query("""
        SELECT r
        FROM Resume r
        JOIN r.user u
        WHERE u.role = 'CANDIDATE'
        ORDER BY r.createdAt DESC
    """)
    List<Resume> findAllCandidateResumes();

}