package com.group.ai_backend.repository;

import com.group.ai_backend.entity.CodingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CodingQuestionRepository
        extends JpaRepository<CodingQuestion, Long> {
}