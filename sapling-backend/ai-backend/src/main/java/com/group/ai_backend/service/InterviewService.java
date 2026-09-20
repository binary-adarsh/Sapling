package com.group.ai_backend.service;

import com.group.ai_backend.entity.Interview;
import com.group.ai_backend.entity.InterviewQuestion;
import com.group.ai_backend.entity.InterviewStatus;
import com.group.ai_backend.entity.JobApplication;
import com.group.ai_backend.entity.Resume;
import com.group.ai_backend.repository.InterviewRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class InterviewService {

    // =========================================================
    // SCORING SCHEME
    //
    // Every question is scored out of 10 and an interview has
    // 5 questions, so the interview total is out of 50.
    // =========================================================

    public static final int TOTAL_QUESTIONS = 5;

    public static final int QUESTION_MAX_SCORE = 10;

    public static final int INTERVIEW_MAX_SCORE =
            TOTAL_QUESTIONS * QUESTION_MAX_SCORE;

    private final InterviewRepository interviewRepository;
    private final ResumeService resumeService;
    private final AiService aiService;
    private final JobApplicationService jobApplicationService;

    @PersistenceContext
    private EntityManager entityManager;

    public InterviewService(
            InterviewRepository interviewRepository,
            ResumeService resumeService,
            AiService aiService,
            JobApplicationService jobApplicationService) {

        this.interviewRepository = interviewRepository;
        this.resumeService = resumeService;
        this.aiService = aiService;
        this.jobApplicationService = jobApplicationService;
    }

    // =========================================================
    // START INTERVIEW
    // =========================================================

    @Transactional
    public Interview startInterview(
            Long applicationId,
            String email) {

        JobApplication application =
                jobApplicationService.getCandidateApplication(
                        applicationId,
                        email
                );

        Resume resume =
                application.getResume();

        if (resume == null) {
            throw new RuntimeException(
                    "No resume found for this application"
            );
        }

        String jobDescription = "";

        if (application.getJob() != null) {
            jobDescription =
                    application.getJob().getDescription();
        }

        String prompt = """
                You are an AI technical interviewer.

                Analyze the candidate's resume and job description.

                Candidate Resume:
                %s

                Job Description:
                %s

                Generate ONE technical interview question
                specifically relevant to this candidate and this job.

                Rules:
                - Ask only ONE question.
                - Do not provide the answer.
                - Do not provide explanation.
                - Question should be suitable for a technical interview.
                - Keep it clear and concise.
                """.formatted(
                resume.getResumeText(),
                jobDescription
        );

        String question =
                aiService.generateInterviewQuestion(prompt);

        Interview interview =
                new Interview();

        interview.setApplication(application);
        interview.setResume(resume);
        interview.setJobDescription(jobDescription);
        interview.setStatus(InterviewStatus.IN_PROGRESS);
        interview.setCreatedAt(LocalDateTime.now());

        InterviewQuestion interviewQuestion =
                new InterviewQuestion();

        interviewQuestion.setInterview(interview);
        interviewQuestion.setQuestionNumber(1);
        interviewQuestion.setQuestion(question);

        interview.getQuestions().add(interviewQuestion);

        return interviewRepository.saveAndFlush(interview);
    }

    // =========================================================
    // SUBMIT ANSWER
    // =========================================================

    @Transactional
    public InterviewQuestion submitAnswer(
            Long interviewId,
            String answer,
            String email) {

        // -----------------------------------------------------
        // 1. FIND INTERVIEW
        // -----------------------------------------------------

        Interview interview =
                interviewRepository
                        .findByIdAndApplicationCandidateEmail(
                                interviewId,
                                email
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Interview not found"
                                )
                        );

        // -----------------------------------------------------
        // 2. CHECK STATUS
        // -----------------------------------------------------

        if (interview.getStatus()
                == InterviewStatus.COMPLETED) {

            throw new RuntimeException(
                    "Interview already completed"
            );
        }

        // -----------------------------------------------------
        // 3. FIND CURRENT UNANSWERED QUESTION
        // -----------------------------------------------------

        InterviewQuestion currentQuestion =
                interview.getQuestions()
                        .stream()
                        .filter(question ->
                                question.getAnswer() == null
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No unanswered question found"
                                )
                        );

        System.out.println(
                "========================================"
        );

        System.out.println(
                "INTERVIEW ID       : "
                        + interviewId
        );

        System.out.println(
                "CURRENT QUESTION   : "
                        + currentQuestion.getQuestionNumber()
        );

        // -----------------------------------------------------
        // 4. SAVE ANSWER FIRST
        // -----------------------------------------------------

        currentQuestion.setAnswer(answer);

        currentQuestion.setAnsweredAt(
                LocalDateTime.now()
        );

        /*
         * Flush answer before AI evaluation.
         * This makes sure candidate answer is not lost
         * even if AI evaluation has an issue.
         */
        entityManager.flush();

        // -----------------------------------------------------
        // 5. AI EVALUATION
        // -----------------------------------------------------

        String evaluation;

        try {

            evaluation =
                    aiService.evaluateInterviewAnswer(
                            interview.getResume()
                                    .getResumeText(),

                            interview.getJobDescription(),

                            currentQuestion.getQuestion(),

                            answer
                    );

        } catch (Exception e) {

            System.out.println(
                    "AI EVALUATION ERROR: "
                            + e.getMessage()
            );

            evaluation = """
                    SCORE: 0.0

                    FEEDBACK:
                    AI evaluation could not be completed.
                    The candidate answer was successfully submitted.
                    """;
        }

        // -----------------------------------------------------
        // 6. EXTRACT SCORE
        // -----------------------------------------------------

        Double score =
                extractScore(evaluation);

        String feedback =
                extractFeedback(evaluation);

        System.out.println(
                "QUESTION SCORE     : "
                        + score
        );

        // -----------------------------------------------------
        // 7. SAVE QUESTION SCORE
        // -----------------------------------------------------

        currentQuestion.setScore(score);
        currentQuestion.setFeedback(feedback);

        /*
         * Explicit flush.
         *
         * This is important for Q5 because we want the
         * question score to be present before calculating
         * the final interview score.
         */
        entityManager.flush();

        // -----------------------------------------------------
        // 8. CHECK IF THIS IS THE LAST QUESTION
        // -----------------------------------------------------

        if (currentQuestion.getQuestionNumber()
                >= TOTAL_QUESTIONS) {

            System.out.println(
                    "Q5 COMPLETION BLOCK ENTERED"
            );

            // -------------------------------------------------
            // CALCULATE FINAL SCORE
            // -------------------------------------------------

            Double finalScore =
                    calculateFinalScore(interview);

            System.out.println(
                    "FINAL INTERVIEW SCORE: "
                            + finalScore
                            + "/"
                            + INTERVIEW_MAX_SCORE
            );

            // -------------------------------------------------
            // MARK INTERVIEW COMPLETED
            // -------------------------------------------------

            interview.setStatus(
                    InterviewStatus.COMPLETED
            );

            interview.setCompletedAt(
                    LocalDateTime.now()
            );

            interview.setFinalScore(
                    finalScore
            );

            interview.setFinalFeedback(
                    "Interview completed successfully. "
                            + "Final score: "
                            + finalScore
                            + "/"
                            + INTERVIEW_MAX_SCORE
            );

            /*
             * Flush EVERYTHING.
             *
             * This forces Hibernate to execute:
             *
             * 1. Q5 answer/score update
             * 2. Interview final_score update
             * 3. Interview final_feedback update
             * 4. Interview status update
             * 5. completed_at update
             */
            entityManager.flush();

            System.out.println(
                    "INTERVIEW COMPLETED SUCCESSFULLY"
            );

            System.out.println(
                    "FINAL SCORE SAVED: "
                            + interview.getFinalScore()
            );

            System.out.println(
                    "========================================"
            );

            return currentQuestion;
        }

        // -----------------------------------------------------
        // 9. GENERATE NEXT QUESTION
        // -----------------------------------------------------

        int nextQuestionNumber =
                currentQuestion.getQuestionNumber() + 1;

        String nextQuestion =
                aiService.generateNextInterviewQuestion(
                        interview.getResume()
                                .getResumeText(),

                        interview.getJobDescription(),

                        currentQuestion.getQuestion(),

                        answer,

                        feedback,

                        nextQuestionNumber
                );

        // -----------------------------------------------------
        // 10. CREATE NEXT QUESTION
        // -----------------------------------------------------

        InterviewQuestion next =
                new InterviewQuestion();

        next.setInterview(interview);

        next.setQuestionNumber(
                nextQuestionNumber
        );

        next.setQuestion(
                nextQuestion
        );

        interview.getQuestions().add(next);

        // -----------------------------------------------------
        // 11. FLUSH NEXT QUESTION
        // -----------------------------------------------------

        entityManager.flush();

        System.out.println(
                "NEXT QUESTION CREATED: "
                        + nextQuestionNumber
        );

        System.out.println(
                "========================================"
        );

        /*
         * Always return the question that was just evaluated,
         * never the newly created one.
         *
         * The caller decides completion from the interview
         * status. Returning the next question here made the
         * caller see question number 5 as soon as question 4
         * was answered, so the interview was reported as
         * completed one question early and the final score
         * was never calculated or saved.
         *
         * The next question is reachable through
         * interview.getQuestions().
         */
        return currentQuestion;
    }

    // =========================================================
    // GET INTERVIEW STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public Map<String, Object> getInterviewStatus(
            Long applicationId,
            String email) {

        /*
         * Verify application belongs to candidate.
         */
        JobApplication application =
                jobApplicationService.getCandidateApplication(
                        applicationId,
                        email
                );

        var interviews =
                interviewRepository.findByApplicationId(
                        application.getId()
                );

        Map<String, Object> response =
                new HashMap<>();

        // -----------------------------------------------------
        // NO INTERVIEW
        // -----------------------------------------------------

        if (interviews.isEmpty()) {

            response.put(
                    "exists",
                    false
            );

            response.put(
                    "completed",
                    false
            );

            response.put(
                    "finalScore",
                    null
            );

            return response;
        }

        // -----------------------------------------------------
        // LATEST INTERVIEW
        // -----------------------------------------------------

        Interview interview =
                interviews.get(
                        interviews.size() - 1
                );

        boolean completed =
                interview.getStatus()
                        == InterviewStatus.COMPLETED;

        response.put(
                "exists",
                true
        );

        response.put(
                "completed",
                completed
        );

        response.put(
                "interviewId",
                interview.getId()
        );

        response.put(
                "status",
                interview.getStatus() != null
                        ? interview.getStatus().name()
                        : null
        );

        response.put(
                "finalScore",
                interview.getFinalScore()
        );

        response.put(
                "finalFeedback",
                interview.getFinalFeedback()
        );

        response.put(
                "completedAt",
                interview.getCompletedAt()
        );

        return response;
    }

    // =========================================================
    // EXTRACT SCORE
    // =========================================================

    private Double extractScore(
            String evaluation) {

        try {

            if (evaluation == null ||
                    evaluation.isBlank()) {

                return 0.0;
            }

            String[] lines =
                    evaluation.split("\\R");

            for (String line : lines) {

                String trimmed =
                        line.trim();

                if (trimmed
                        .toUpperCase()
                        .startsWith("SCORE:")) {

                    String value =
                            trimmed.substring(
                                    trimmed.indexOf(":") + 1
                            ).trim();

                    String[] parts =
                            value.split("\\s+");

                    return Double.parseDouble(
                            parts[0]
                    );
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "SCORE EXTRACTION ERROR: "
                            + e.getMessage()
            );
        }

        return 0.0;
    }

    // =========================================================
    // EXTRACT FEEDBACK
    // =========================================================

    private String extractFeedback(
            String evaluation) {

        if (evaluation == null ||
                evaluation.isBlank()) {

            return "No feedback was generated.";
        }

        String upper =
                evaluation.toUpperCase();

        int index =
                upper.indexOf("FEEDBACK:");

        if (index == -1) {

            return evaluation.trim();
        }

        return evaluation
                .substring(index + 9)
                .trim();
    }

    // =========================================================
    // CALCULATE FINAL SCORE
    //
    // The interview score is the TOTAL of the question scores,
    // not their average: 5 questions x 10 marks = 50.
    //
    // A question that was never scored counts as 0, so the
    // total is always out of INTERVIEW_MAX_SCORE.
    // =========================================================

    private Double calculateFinalScore(
            Interview interview) {

        double total = 0.0;

        for (InterviewQuestion question :
                interview.getQuestions()) {

            System.out.println(
                    "Question "
                            + question.getQuestionNumber()
                            + " score = "
                            + question.getScore()
            );

            if (question.getScore() != null) {

                total +=
                        question.getScore();
            }
        }

        return Math.round(
                total * 100.0
        ) / 100.0;
    }
}