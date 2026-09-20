package com.group.ai_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResumeMatchRequest {

    private Long resumeId;

    private String jobDescription;
}