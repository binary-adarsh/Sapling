package com.group.ai_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // JOB APPLICATION
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    // ==========================================
    // RESUME
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    // ==========================================
    // JOB DESCRIPTION
    // ==========================================

    @Column(columnDefinition = "LONGTEXT")
    private String jobDescription;

    // ==========================================
    // INTERVIEW QUESTIONS
    // ==========================================

    @OneToMany(
            mappedBy = "interview",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("questionNumber ASC")
    private List<InterviewQuestion> questions =
            new ArrayList<>();

    // ==========================================
    // STATUS
    // ==========================================

    @Enumerated(EnumType.STRING)
    private InterviewStatus status;

    // ==========================================
    // FINAL SCORE
    // ==========================================

    private Double finalScore;

    // ==========================================
    // FINAL FEEDBACK
    // ==========================================

    @Column(columnDefinition = "LONGTEXT")
    private String finalFeedback;

    // ==========================================
    // TIMESTAMPS
    // ==========================================

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    // ==========================================
    // PRE PERSIST
    // ==========================================

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();

        if (status == null) {
            status = InterviewStatus.IN_PROGRESS;
        }
    }
}