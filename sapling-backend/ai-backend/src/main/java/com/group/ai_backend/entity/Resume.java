package com.group.ai_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name")
    private String fileName;

    @Lob
    @Column(name = "resume_text", columnDefinition = "LONGTEXT")
    private String resumeText;

    @Lob
    @Column(name = "ai_analysis", columnDefinition = "LONGTEXT")
    private String aiAnalysis;

    private Double score;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({
            "password",
            "resumes",
            "hibernateLazyInitializer",
            "handler"
    })
    private User user;
}

