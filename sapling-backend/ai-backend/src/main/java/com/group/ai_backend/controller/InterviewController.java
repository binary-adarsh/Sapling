package com.group.ai_backend.controller;

import com.group.ai_backend.dto.InterviewAnswerResponse;
import com.group.ai_backend.dto.InterviewStartResponse;
import com.group.ai_backend.entity.Interview;
import com.group.ai_backend.entity.InterviewQuestion;
import com.group.ai_backend.entity.InterviewStatus;
import com.group.ai_backend.service.InterviewService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    // =====================================================
    // START INTERVIEW
    // =====================================================

    @PostMapping("/start")
    public ResponseEntity<InterviewStartResponse> startInterview(
            @RequestParam Long applicationId,
            Authentication authentication) {

        String email = authentication.getName();

        Interview interview =
                interviewService.startInterview(
                        applicationId,
                        email
                );

        InterviewQuestion firstQuestion =
                interview.getQuestions()
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Interview question was not created"
                                )
                        );

        InterviewStartResponse response =
                new InterviewStartResponse(
                        interview.getId(),
                        firstQuestion.getQuestionNumber(),
                        firstQuestion.getQuestion()
                );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // SUBMIT INTERVIEW ANSWER
    // =====================================================

    @PostMapping("/{interviewId}/answer")
    public ResponseEntity<InterviewAnswerResponse> submitAnswer(
            @PathVariable Long interviewId,
            @RequestBody com.group.ai_backend.dto.InterviewAnswerRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        // -------------------------------------------------
        // The service returns the question that was just
        // evaluated, together with its interview.
        // -------------------------------------------------

        InterviewQuestion evaluatedQuestion =
                interviewService.submitAnswer(
                        interviewId,
                        request.getAnswer(),
                        email
                );

        Interview interview =
                evaluatedQuestion.getInterview();

        // =================================================
        // INTERVIEW COMPLETED
        //
        // Completion comes from the interview status, not
        // from a question number. Question 5 already exists
        // the moment question 4 is answered, so a number
        // check ends the interview one question early and
        // the final score never gets calculated or saved.
        // =================================================

        if (interview.getStatus() == InterviewStatus.COMPLETED) {

            InterviewAnswerResponse response =
                    new InterviewAnswerResponse(
                            interviewId,
                            evaluatedQuestion.getQuestionNumber(),
                            evaluatedQuestion.getScore(),
                            evaluatedQuestion.getFeedback(),
                            null,
                            true,
                            interview.getFinalScore()
                    );

            return ResponseEntity.ok(response);
        }

        // =================================================
        // NEXT QUESTION
        // =================================================

        int nextQuestionNumber =
                evaluatedQuestion.getQuestionNumber() + 1;

        String nextQuestion =
                interview.getQuestions()
                        .stream()
                        .filter(question ->
                                question.getQuestionNumber()
                                        .equals(nextQuestionNumber)
                        )
                        .map(InterviewQuestion::getQuestion)
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Next question was not created"
                                )
                        );

        InterviewAnswerResponse response =
                new InterviewAnswerResponse(
                        interviewId,
                        evaluatedQuestion.getQuestionNumber(),
                        evaluatedQuestion.getScore(),
                        evaluatedQuestion.getFeedback(),
                        nextQuestion,
                        false,
                        null
                );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET INTERVIEW STATUS FOR APPLICATION
    // =====================================================

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<?> getInterviewStatus(
            @PathVariable Long applicationId,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                interviewService.getInterviewStatus(
                        applicationId,
                        email
                )
        );
    }
}