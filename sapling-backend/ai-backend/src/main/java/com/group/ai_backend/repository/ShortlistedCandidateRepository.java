package com.group.ai_backend.repository;

import com.group.ai_backend.entity.ShortlistedCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ShortlistedCandidateRepository
        extends JpaRepository<ShortlistedCandidate, Long> {

    // =====================================================
    // GET ALL SHORTLISTED CANDIDATES OF RECRUITER
    // =====================================================

    List<ShortlistedCandidate> findByRecruiterId(Long recruiterId);


    // =====================================================
    // CHECK IF RESUME IS ALREADY SHORTLISTED
    // =====================================================

    Optional<ShortlistedCandidate> findByRecruiterIdAndResumeId(
            Long recruiterId,
            Long resumeId
    );


    // =====================================================
    // DELETE SHORTLIST
    // =====================================================

    @Transactional
    @Modifying
    @Query("""
            DELETE FROM ShortlistedCandidate sc
            WHERE sc.recruiter.id = :recruiterId
            AND sc.resume.id = :resumeId
            """)
    void deleteByRecruiterIdAndResumeId(
            @Param("recruiterId") Long recruiterId,
            @Param("resumeId") Long resumeId
    );


    // =====================================================
    // CHECK EXISTS
    // =====================================================

    boolean existsByRecruiterIdAndResumeId(
            Long recruiterId,
            Long resumeId
    );
}