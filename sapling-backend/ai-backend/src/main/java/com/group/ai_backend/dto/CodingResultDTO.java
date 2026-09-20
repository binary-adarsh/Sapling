package com.group.ai_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CodingResultDTO {

    private Long sessionId;

    private boolean completed;

    private Double question1Score;

    private Double question2Score;

    private Double question3Score;

    private Double totalScore;

    private Double maxScore;

    private Double averageScore;

    private Double percentage;
}