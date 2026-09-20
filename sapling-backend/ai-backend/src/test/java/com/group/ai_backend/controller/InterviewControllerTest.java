package com.group.ai_backend.controller;

import com.group.ai_backend.dto.InterviewAnswerRequest;
import com.group.ai_backend.dto.InterviewAnswerResponse;
import com.group.ai_backend.entity.Interview;
import com.group.ai_backend.entity.InterviewQuestion;
import com.group.ai_backend.entity.InterviewStatus;
import com.group.ai_backend.service.InterviewService;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class InterviewControllerTest {

    private static final Authentication AUTH =
            new UsernamePasswordAuthenticationToken(
                    "candidate@example.com",
                    "n/a"
            );

    // =====================================================
    // HELPERS
    // =====================================================

    private static InterviewQuestion question(
            Interview interview,
            int number,
            String text,
            Double score,
            String feedback) {

        InterviewQuestion question =
                new InterviewQuestion();

        question.setInterview(interview);
        question.setQuestionNumber(number);
        question.setQuestion(text);
        question.setScore(score);
        question.setFeedback(feedback);

        interview.getQuestions().add(question);

        return question;
    }

    private static InterviewController controllerReturning(
            InterviewQuestion evaluated) {

        InterviewService service =
                mock(InterviewService.class);

        when(service.submitAnswer(
                anyLong(),
                anyString(),
                anyString()
        )).thenReturn(evaluated);

        return new InterviewController(service);
    }

    private static InterviewAnswerRequest answer(String text) {

        InterviewAnswerRequest request =
                new InterviewAnswerRequest();

        request.setAnswer(text);

        return request;
    }

    // =====================================================
    // ANSWERING QUESTION 4 MUST NOT END THE INTERVIEW
    //
    // Question 5 already exists at this point. The old
    // controller read its number, reported the interview as
    // completed and returned a null final score, so the
    // recruiter never saw an interview score.
    // =====================================================

    @Test
    void answeringQuestionFourReturnsQuestionFive() {

        Interview interview = new Interview();
        interview.setId(41L);
        interview.setStatus(InterviewStatus.IN_PROGRESS);

        question(interview, 1, "Q1", 0.0, "f1");
        question(interview, 2, "Q2", 7.5, "f2");
        question(interview, 3, "Q3", 6.5, "f3");

        InterviewQuestion fourth =
                question(interview, 4, "Q4", 8.5, "f4");

        question(interview, 5, "Q5", null, null);

        InterviewAnswerResponse response =
                controllerReturning(fourth)
                        .submitAnswer(
                                41L,
                                answer("my answer"),
                                AUTH
                        )
                        .getBody();

        assertFalse(
                response.isCompleted(),
                "interview must stay open until question 5 is answered"
        );

        assertEquals(4, response.getQuestionNumber());
        assertEquals(8.5, response.getScore());
        assertEquals("f4", response.getFeedback());
        assertEquals("Q5", response.getNextQuestion());
        assertNull(response.getFinalScore());
    }

    // =====================================================
    // ANSWERING QUESTION 5 COMPLETES AND RETURNS THE SCORE
    // =====================================================

    @Test
    void answeringQuestionFiveReturnsFinalScore() {

        Interview interview = new Interview();
        interview.setId(41L);
        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setFinalScore(6.9);

        question(interview, 1, "Q1", 0.0, "f1");
        question(interview, 2, "Q2", 7.5, "f2");
        question(interview, 3, "Q3", 6.5, "f3");
        question(interview, 4, "Q4", 8.5, "f4");

        InterviewQuestion fifth =
                question(interview, 5, "Q5", 8.0, "f5");

        InterviewAnswerResponse response =
                controllerReturning(fifth)
                        .submitAnswer(
                                41L,
                                answer("my answer"),
                                AUTH
                        )
                        .getBody();

        assertTrue(response.isCompleted());
        assertEquals(5, response.getQuestionNumber());
        assertEquals(6.9, response.getFinalScore());
        assertNull(response.getNextQuestion());
    }

    // =====================================================
    // EARLIER QUESTIONS KEEP WORKING
    // =====================================================

    @Test
    void answeringQuestionOneReturnsQuestionTwo() {

        Interview interview = new Interview();
        interview.setId(41L);
        interview.setStatus(InterviewStatus.IN_PROGRESS);

        InterviewQuestion first =
                question(interview, 1, "Q1", 7.0, "f1");

        question(interview, 2, "Q2", null, null);

        InterviewAnswerResponse response =
                controllerReturning(first)
                        .submitAnswer(
                                41L,
                                answer("my answer"),
                                AUTH
                        )
                        .getBody();

        assertFalse(response.isCompleted());
        assertEquals(1, response.getQuestionNumber());
        assertEquals("Q2", response.getNextQuestion());
        assertNull(response.getFinalScore());
    }

    // =====================================================
    // SANITY: THE LIST TRAVERSAL PICKS THE RIGHT QUESTION
    // =====================================================

    @Test
    void interviewKeepsAllFiveQuestions() {

        Interview interview = new Interview();

        question(interview, 1, "Q1", null, null);
        question(interview, 2, "Q2", null, null);

        List<InterviewQuestion> questions =
                interview.getQuestions();

        assertEquals(2, questions.size());
        assertEquals("Q2", questions.get(1).getQuestion());
    }
}
