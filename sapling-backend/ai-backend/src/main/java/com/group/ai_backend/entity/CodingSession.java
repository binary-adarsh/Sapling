package com.group.ai_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class CodingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // CANDIDATE
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ==========================================
    // JOB APPLICATION
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private JobApplication application;

    // ==========================================
    // RANDOM 3 QUESTIONS
    // ==========================================

    private Long question1Id;

    private Long question2Id;

    private Long question3Id;

    // ==========================================
    // CURRENT QUESTION
    // ==========================================

    private int currentQuestion = 1;

    // ==========================================
    // COMPLETED
    // ==========================================

    private boolean completed = false;
}