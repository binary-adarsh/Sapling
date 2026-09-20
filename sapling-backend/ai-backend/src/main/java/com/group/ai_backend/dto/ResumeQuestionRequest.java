package com.group.ai_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResumeQuestionRequest {

    private Long resumeId;

    private String question;
}