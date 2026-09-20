package com.group.ai_backend.service;

import com.group.ai_backend.dto.CodingResultDTO;
import com.group.ai_backend.entity.CodingQuestion;
import com.group.ai_backend.entity.CodingSession;
import com.group.ai_backend.entity.CodingSubmission;
import com.group.ai_backend.entity.JobApplication;
import com.group.ai_backend.entity.User;

import com.group.ai_backend.repository.CodingQuestionRepository;
import com.group.ai_backend.repository.CodingSessionRepository;
import com.group.ai_backend.repository.CodingSubmissionRepository;
import com.group.ai_backend.repository.JobApplicationRepository;
import com.group.ai_backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CodingSessionService {

    private final CodingQuestionRepository codingQuestionRepository;
    private final CodingSessionRepository codingSessionRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public CodingSessionService(
            CodingQuestionRepository codingQuestionRepository,
            CodingSessionRepository codingSessionRepository,
            CodingSubmissionRepository codingSubmissionRepository,
            UserRepository userRepository,
            JobApplicationRepository jobApplicationRepository) {

        this.codingQuestionRepository =
                codingQuestionRepository;

        this.codingSessionRepository =
                codingSessionRepository;

        this.codingSubmissionRepository =
                codingSubmissionRepository;

        this.userRepository =
                userRepository;

        this.jobApplicationRepository =
                jobApplicationRepository;
    }

    // =====================================================
    // START CODING SESSION
    // =====================================================

    public CodingSession startSession(
            Long applicationId,
            String email) {

        // ==========================================
        // 1. Find candidate
        // ==========================================

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        // ==========================================
        // 2. Find candidate's application
        // ==========================================

        JobApplication application =
                jobApplicationRepository
                        .findByIdAndCandidateEmail(
                                applicationId,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job application not found"
                                )
                        );

        // ==========================================
        // 3. Get coding questions
        // ==========================================

        List<CodingQuestion> questions =
                codingQuestionRepository.findAll();

        if (questions.size() < 3) {

            throw new RuntimeException(
                    "At least 3 coding questions are required"
            );
        }

        // ==========================================
        // 4. Randomize questions
        // ==========================================

        Collections.shuffle(questions);

        // ==========================================
        // 5. Create session
        // ==========================================

        CodingSession session =
                new CodingSession();

        session.setUser(user);

        session.setApplication(application);

        session.setQuestion1Id(
                questions.get(0).getId()
        );

        session.setQuestion2Id(
                questions.get(1).getId()
        );

        session.setQuestion3Id(
                questions.get(2).getId()
        );

        session.setCurrentQuestion(1);

        session.setCompleted(false);

        return codingSessionRepository.save(
                session
        );
    }

    // =====================================================
    // GET CURRENT QUESTION
    // =====================================================

    public CodingQuestion getCurrentQuestion(
            Long sessionId,
            String email) {

        CodingSession session =
                codingSessionRepository
                        .findByIdAndApplicationCandidateEmail(
                                sessionId,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coding session not found"
                                )
                        );

        if (session.isCompleted()) {

            throw new RuntimeException(
                    "Coding session already completed"
            );
        }

        Long questionId;

        if (session.getCurrentQuestion() == 1) {

            questionId =
                    session.getQuestion1Id();

        } else if (
                session.getCurrentQuestion() == 2) {

            questionId =
                    session.getQuestion2Id();

        } else if (
                session.getCurrentQuestion() == 3) {

            questionId =
                    session.getQuestion3Id();

        } else {

            throw new RuntimeException(
                    "Invalid question number"
            );
        }

        if (questionId == null) {

            throw new RuntimeException(
                    "Question ID is null"
            );
        }

        return codingQuestionRepository
                .findById(questionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Coding question not found"
                        )
                );
    }

    // =====================================================
    // MOVE TO NEXT QUESTION
    // =====================================================

    public CodingQuestion moveToNextQuestion(
            Long sessionId,
            String email) {

        CodingSession session =
                codingSessionRepository
                        .findByIdAndApplicationCandidateEmail(
                                sessionId,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coding session not found"
                                )
                        );

        if (session.isCompleted()) {

            throw new RuntimeException(
                    "Coding session already completed"
            );
        }

        // ==========================================
        // Q1 → Q2
        // ==========================================

        if (session.getCurrentQuestion() == 1) {

            session.setCurrentQuestion(2);

            codingSessionRepository.save(session);

            return getCurrentQuestion(
                    sessionId,
                    email
            );
        }

        // ==========================================
        // Q2 → Q3
        // ==========================================

        if (session.getCurrentQuestion() == 2) {

            session.setCurrentQuestion(3);

            codingSessionRepository.save(session);

            return getCurrentQuestion(
                    sessionId,
                    email
            );
        }

        // ==========================================
        // Q3 → COMPLETE
        // ==========================================

        if (session.getCurrentQuestion() == 3) {

            session.setCompleted(true);

            codingSessionRepository.save(session);

            return null;
        }

        throw new RuntimeException(
                "Invalid question number"
        );
    }

    // =====================================================
    // GET FINAL CODING RESULT
    // =====================================================

    public CodingResultDTO getSessionResult(
            Long sessionId,
            String email) {

        CodingSession session =
                codingSessionRepository
                        .findByIdAndApplicationCandidateEmail(
                                sessionId,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coding session not found"
                                )
                        );

        Long question1Id =
                session.getQuestion1Id();

        Long question2Id =
                session.getQuestion2Id();

        Long question3Id =
                session.getQuestion3Id();

        // ==========================================
        // ONLY THIS SESSION'S SUBMISSIONS
        // ==========================================

        List<CodingSubmission> submissions =
                codingSubmissionRepository
                        .findBySessionId(sessionId);

        double question1Score =
                getScore(
                        submissions,
                        question1Id
                );

        double question2Score =
                getScore(
                        submissions,
                        question2Id
                );

        double question3Score =
                getScore(
                        submissions,
                        question3Id
                );

        // ==========================================
        // TOTAL SCORE
        // ==========================================

        double totalScore =
                question1Score
                        + question2Score
                        + question3Score;

        double averageScore =
                totalScore / 3.0;

        double percentage =
                (totalScore / 30.0) * 100.0;

        // ==========================================
        // ROUND
        // ==========================================

        totalScore =
                Math.round(
                        totalScore * 100.0
                ) / 100.0;

        averageScore =
                Math.round(
                        averageScore * 100.0
                ) / 100.0;

        percentage =
                Math.round(
                        percentage * 100.0
                ) / 100.0;

        // ==========================================
        // RESULT DTO
        // ==========================================

        CodingResultDTO result =
                new CodingResultDTO();

        result.setSessionId(sessionId);

        result.setCompleted(
                session.isCompleted()
        );

        result.setQuestion1Score(
                question1Score
        );

        result.setQuestion2Score(
                question2Score
        );

        result.setQuestion3Score(
                question3Score
        );

        result.setTotalScore(
                totalScore
        );

        result.setMaxScore(
                30.0
        );

        result.setAverageScore(
                averageScore
        );

        result.setPercentage(
                percentage
        );

        return result;
    }

    // =====================================================
    // GET SCORE
    // =====================================================

    private double getScore(
            List<CodingSubmission> submissions,
            Long questionId) {

        if (questionId == null) {
            return 0.0;
        }

        for (CodingSubmission submission :
                submissions) {

            if (submission == null) {
                continue;
            }

            if (submission.getQuestion() == null) {
                continue;
            }

            if (submission.getQuestion().getId() == null) {
                continue;
            }

            if (submission.getScore() == null) {
                continue;
            }

            if (submission.getQuestion()
                    .getId()
                    .equals(questionId)) {

                return submission.getScore();
            }
        }

        return 0.0;
    }
}