package com.group.ai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterApplicationResultDTO {

    private Long applicationId;

    private Long jobId;

    private String jobTitle;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private Long resumeId;

    private String resumeFileName;

    private Double resumeScore;

    private Double interviewScore;

    private Double codingScore;

    private Double finalScore;

    private String applicationStatus;

    private String appliedAt;
}