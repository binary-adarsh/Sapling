package com.group.ai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InterviewAnswerResponse {

    private Long interviewId;

    private Integer questionNumber;

    private Double score;

    private String feedback;

    private String nextQuestion;

    private boolean completed;

    // ==========================================
    // FINAL INTERVIEW SCORE
    // ==========================================

    private Double finalScore;
}