package com.group.ai_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JobRequest {

    private String title;

    private String description;

    private String skills;

    private String experience;
}