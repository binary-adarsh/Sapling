package com.group.ai_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class CodingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private CodingQuestion question;

    @ManyToOne
    private User user;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private CodingSession session;

    @Column(columnDefinition = "LONGTEXT")
    private String code;

    private Double score;

    @Column(columnDefinition = "LONGTEXT")
    private String feedback;

    private LocalDateTime submittedAt;
}