package com.group.ai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class InterviewStartResponse {

    private Long interviewId;

    private Integer questionNumber;

    private String question;
}