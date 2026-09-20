package com.group.ai_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "shortlisted_candidates",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "recruiter_id",
                                "resume_id"
                        }
                )
        }
)
@Getter
@Setter
public class ShortlistedCandidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // RECRUITER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "recruiter_id",
            nullable = false
    )
    private User recruiter;


    // =====================================================
    // CANDIDATE RESUME
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "resume_id",
            nullable = false
    )
    private Resume resume;


    // =====================================================
    // CREATED TIME
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime shortlistedAt;


    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    public void onCreate() {
        if (shortlistedAt == null) {
            shortlistedAt = LocalDateTime.now();
        }
    }
}