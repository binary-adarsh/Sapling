package com.group.ai_backend.service;

import com.group.ai_backend.entity.CodingQuestion;
import com.group.ai_backend.entity.CodingSession;
import com.group.ai_backend.entity.CodingSubmission;
import com.group.ai_backend.entity.User;

import com.group.ai_backend.repository.CodingQuestionRepository;
import com.group.ai_backend.repository.CodingSessionRepository;
import com.group.ai_backend.repository.CodingSubmissionRepository;
import com.group.ai_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CodingService {

    private final CodingQuestionRepository codingQuestionRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final CodingSessionRepository codingSessionRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public CodingService(
            CodingQuestionRepository codingQuestionRepository,
            CodingSubmissionRepository codingSubmissionRepository,
            CodingSessionRepository codingSessionRepository,
            UserRepository userRepository,
            AiService aiService) {

        this.codingQuestionRepository = codingQuestionRepository;
        this.codingSubmissionRepository = codingSubmissionRepository;
        this.codingSessionRepository = codingSessionRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    // =====================================================
    // GET RANDOM 3 QUESTIONS
    // =====================================================

    public List<CodingQuestion> getRandomQuestions() {

        List<CodingQuestion> questions =
                codingQuestionRepository.findAll();

        if (questions.size() < 3) {
            throw new RuntimeException(
                    "At least 3 coding questions are required"
            );
        }

        Collections.shuffle(questions);

        return questions.subList(0, 3);
    }

    // =====================================================
    // OLD SUBMIT CODE
    // =====================================================

    public CodingSubmission submitCode(
            Long questionId,
            String code,
            String email) {

        CodingQuestion question =
                codingQuestionRepository
                        .findById(questionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coding question not found"
                                )
                        );

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        String evaluation =
                aiService.evaluateCodingSolution(
                        question.getDescription(),
                        code
                );

        Double score =
                extractScore(evaluation);

        CodingSubmission submission =
                new CodingSubmission();

        submission.setQuestion(question);
        submission.setUser(user);
        submission.setCode(code);
        submission.setFeedback(evaluation);
        submission.setScore(score);

        submission.setSubmittedAt(
                LocalDateTime.now()
        );

        return codingSubmissionRepository.save(
                submission
        );
    }

    // =====================================================
    // SESSION BASED SUBMIT
    // =====================================================

    public CodingSubmission submitCodeForSession(
            Long sessionId,
            String code,
            String email) {

        // ---------------------------------------------
        // Find coding session
        // ---------------------------------------------

        CodingSession session =
                codingSessionRepository
                        .findByIdAndUserEmail(
                                sessionId,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coding session not found"
                                )
                        );

        // ---------------------------------------------
        // Check session status
        // ---------------------------------------------

        if (session.isCompleted()) {
            throw new RuntimeException(
                    "Coding session already completed"
            );
        }

        // ---------------------------------------------
        // Get current question ID
        // ---------------------------------------------

        Long questionId;

        if (session.getCurrentQuestion() == 1) {

            questionId =
                    session.getQuestion1Id();

        } else if (session.getCurrentQuestion() == 2) {

            questionId =
                    session.getQuestion2Id();

        } else if (session.getCurrentQuestion() == 3) {

            questionId =
                    session.getQuestion3Id();

        } else {

            throw new RuntimeException(
                    "Invalid question number"
            );
        }

        // ---------------------------------------------
        // Find question
        // ---------------------------------------------

        if (questionId == null) {
            throw new RuntimeException(
                    "Question ID is null"
            );
        }

        CodingQuestion question =
                codingQuestionRepository
                        .findById(questionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coding question not found"
                                )
                        );

        // ---------------------------------------------
        // Find user
        // ---------------------------------------------

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        // ---------------------------------------------
        // Mistral evaluation
        // ---------------------------------------------

        String evaluation =
                aiService.evaluateCodingSolution(
                        question.getDescription(),
                        code
                );

        // ---------------------------------------------
        // Extract score
        // ---------------------------------------------

        Double score =
                extractScore(evaluation);

        // ---------------------------------------------
        // Create submission
        // ---------------------------------------------

        CodingSubmission submission =
                new CodingSubmission();

        submission.setQuestion(question);

        submission.setUser(user);

        /*
         * IMPORTANT FIX:
         *
         * Submission ko current coding session
         * ke saath associate kar rahe hain.
         *
         * Isse final result mein sirf isi
         * session ke scores use honge.
         */
        submission.setSession(session);

        submission.setCode(code);

        submission.setFeedback(evaluation);

        submission.setScore(score);

        submission.setSubmittedAt(
                LocalDateTime.now()
        );

        // ---------------------------------------------
        // Save submission
        // ---------------------------------------------

        CodingSubmission savedSubmission =
                codingSubmissionRepository.save(
                        submission
                );

        // ---------------------------------------------
        // Move to next question
        // ---------------------------------------------

        if (session.getCurrentQuestion() < 3) {

            session.setCurrentQuestion(
                    session.getCurrentQuestion() + 1
            );

        } else {

            session.setCompleted(true);
        }

        // ---------------------------------------------
        // Save updated session
        // ---------------------------------------------

        codingSessionRepository.save(session);

        return savedSubmission;
    }

    // =====================================================
    // EXTRACT SCORE FROM MISTRAL FEEDBACK
    // =====================================================

    private Double extractScore(String evaluation) {

        Pattern pattern =
                Pattern.compile(
                        "(?i)Score\\s*/\\s*10\\s*:\\s*" +
                                "(10(?:\\.\\d+)?|[0-9](?:\\.\\d+)?)"
                );

        Matcher matcher =
                pattern.matcher(evaluation);

        if (matcher.find()) {

            return Double.parseDouble(
                    matcher.group(1)
            );
        }

        return null;
    }
}