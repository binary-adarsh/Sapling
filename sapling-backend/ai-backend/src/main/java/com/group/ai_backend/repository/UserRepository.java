package com.group.ai_backend.repository;

import com.group.ai_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    // =====================================================
    // FIND USER BY EMAIL
    // =====================================================

    Optional<User> findByEmail(String email);


    // =====================================================
    // GET ALL CANDIDATES
    // =====================================================

    @Query("""
        SELECT u
        FROM User u
        WHERE u.role = 'CANDIDATE'
        ORDER BY u.name ASC
    """)
    List<User> findAllCandidates();
}