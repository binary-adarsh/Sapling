package com.group.ai_backend.repository;

import com.group.ai_backend.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findByInterviewIdOrderByQuestionNumberAsc(
            Long interviewId
    );

    Optional<InterviewQuestion>
    findByInterviewIdAndQuestionNumber(
            Long interviewId,
            Integer questionNumber
    );
}