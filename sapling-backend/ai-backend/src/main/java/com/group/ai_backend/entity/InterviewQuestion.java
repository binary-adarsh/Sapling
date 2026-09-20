package com.group.ai_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // Interview
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    // ==========================================
    // Question Number
    // ==========================================

    @Column(nullable = false)
    private Integer questionNumber;

    // ==========================================
    // AI Generated Question
    // ==========================================

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String question;

    // ==========================================
    // Candidate Answer
    // ==========================================

    @Column(columnDefinition = "LONGTEXT")
    private String answer;

    // ==========================================
    // AI Score
    // ==========================================

    private Double score;

    // ==========================================
    // AI Feedback
    // ==========================================

    @Column(columnDefinition = "LONGTEXT")
    private String feedback;

    // ==========================================
    // Timestamps
    // ==========================================

    private LocalDateTime createdAt;

    private LocalDateTime answeredAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
    }
}