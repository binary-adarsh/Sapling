package com.group.ai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResumeStatsResponse {

    private long totalResumes;
    private Double averageScore;
    private Double bestScore;
}