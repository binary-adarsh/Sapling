package com.group.ai_backend.service;

import com.group.ai_backend.dto.RecruiterApplicationResultDTO;
import com.group.ai_backend.entity.CodingSession;
import com.group.ai_backend.entity.Job;
import com.group.ai_backend.entity.JobApplication;
import com.group.ai_backend.entity.Resume;
import com.group.ai_backend.entity.User;
import com.group.ai_backend.entity.CodingSubmission;
import com.group.ai_backend.entity.Interview;
import com.group.ai_backend.repository.CodingSessionRepository;
import com.group.ai_backend.repository.CodingSubmissionRepository;
import com.group.ai_backend.repository.InterviewRepository;
import com.group.ai_backend.repository.JobApplicationRepository;
import com.group.ai_backend.repository.JobRepository;
import com.group.ai_backend.repository.ResumeRepository;
import com.group.ai_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class JobApplicationService {

    // =====================================================
    // SCORING SCHEME
    //
    // Resume     : 1 AI score  x 10 marks = 10
    // Interview  : 5 questions x 10 marks = 50
    // Coding     : 3 questions x 10 marks = 30
    //                                      ----
    // Final      : total of the three      = 90
    // =====================================================

    public static final int RESUME_MAX_SCORE = 10;

    public static final int INTERVIEW_MAX_SCORE =
            InterviewService.INTERVIEW_MAX_SCORE;

    public static final int CODING_QUESTIONS = 3;

    public static final int CODING_MAX_SCORE =
            CODING_QUESTIONS * 10;

    public static final int FINAL_MAX_SCORE =
            RESUME_MAX_SCORE
                    + INTERVIEW_MAX_SCORE
                    + CODING_MAX_SCORE;

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    private final InterviewRepository interviewRepository;
    private final CodingSessionRepository codingSessionRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;

    public JobApplicationService(
            JobApplicationRepository applicationRepository,
            JobRepository jobRepository,
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            InterviewRepository interviewRepository,
            CodingSessionRepository codingSessionRepository,
            CodingSubmissionRepository codingSubmissionRepository
    ) {

        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;

        this.interviewRepository = interviewRepository;
        this.codingSessionRepository = codingSessionRepository;
        this.codingSubmissionRepository = codingSubmissionRepository;
    }

    // =====================================================
    // APPLY FOR JOB
    // =====================================================

    public JobApplication applyForJob(
            Long jobId,
            Long resumeId,
            String email
    ) {

        User candidate =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );

        // Candidate check
        if (!"CANDIDATE".equalsIgnoreCase(
                candidate.getRole())) {

            throw new RuntimeException(
                    "Only candidates can apply for jobs"
            );
        }

        // Find job
        Job job =
                jobRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        // Check active
        if (!job.isActive()) {

            throw new RuntimeException(
                    "This job is no longer active"
            );
        }

        // Find resume
        Resume resume =
                resumeRepository.findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );

        // Make sure resume belongs to candidate
        if (resume.getUser() == null ||
                !resume.getUser()
                        .getEmail()
                        .equalsIgnoreCase(email)) {

            throw new RuntimeException(
                    "You can only apply using your own resume"
            );
        }

        // Prevent duplicate application
        if (applicationRepository
                .findByJobIdAndCandidateEmail(
                        jobId,
                        email
                )
                .isPresent()) {

            throw new RuntimeException(
                    "You have already applied for this job"
            );
        }

        // Create application
        JobApplication application =
                JobApplication.builder()
                        .job(job)
                        .candidate(candidate)
                        .resume(resume)
                        .status("APPLIED")
                        .appliedAt(LocalDateTime.now())
                        .build();

        return applicationRepository.save(
                application
        );
    }

    // =====================================================
    // MY APPLICATIONS
    // =====================================================

    public List<JobApplication> getMyApplications(
            String email
    ) {

        return applicationRepository
                .findByCandidateEmail(email);
    }

    // =====================================================
    // CHECK APPLICATION
    // =====================================================

    public boolean hasApplied(
            Long jobId,
            String email
    ) {

        return applicationRepository
                .findByJobIdAndCandidateEmail(
                        jobId,
                        email
                )
                .isPresent();
    }

    // =====================================================
    // GET SINGLE CANDIDATE APPLICATION
    // =====================================================

    public JobApplication getCandidateApplication(
            Long applicationId,
            String email
    ) {

        return applicationRepository
                .findByIdAndCandidateEmail(
                        applicationId,
                        email
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job application not found"
                        )
                );
    }

    // =====================================================
    // GET JOB APPLICATIONS
    // RECRUITER
    // =====================================================

    public List<JobApplication> getJobApplications(
            Long jobId,
            String recruiterEmail
    ) {

        Job job =
                jobRepository
                        .findByIdAndRecruiterEmail(
                                jobId,
                                recruiterEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        return applicationRepository
                .findByJobId(
                        job.getId()
                );
    }

    // =====================================================
    // RECRUITER APPLICATION RESULTS
    // =====================================================

    public List<RecruiterApplicationResultDTO>
    getRecruiterApplicationResults(
            Long jobId,
            String recruiterEmail
    ) {

        // -------------------------------------------------
        // First verify that this job belongs to recruiter
        // -------------------------------------------------

        Job job =
                jobRepository
                        .findByIdAndRecruiterEmail(
                                jobId,
                                recruiterEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        // -------------------------------------------------
        // Get all applications
        // -------------------------------------------------

        List<JobApplication> applications =
                applicationRepository.findByJobId(
                        job.getId()
                );

        List<RecruiterApplicationResultDTO> results =
                new ArrayList<>();

        // -------------------------------------------------
        // Process every candidate application
        // -------------------------------------------------

        for (JobApplication application : applications) {

            User candidate =
                    application.getCandidate();

            Resume resume =
                    application.getResume();

            Double resumeScore = null;
            Double interviewScore = null;
            Double codingScore = null;

            // =============================================
            // RESUME SCORE
            // =============================================

            if (resume != null) {
                resumeScore = resume.getScore();
            }

            // =============================================
            // INTERVIEW SCORE
            // =============================================

            List<Interview> interviews =
                    interviewRepository.findByApplicationId(
                            application.getId()
                    );

            if (interviews != null &&
                    !interviews.isEmpty()) {

                // Normally one interview belongs to
                // one job application.
                Interview latestInterview =
                        interviews.get(
                                interviews.size() - 1
                        );

                interviewScore =
                        latestInterview.getFinalScore();
            }

            // =============================================
            // CODING SCORE
            //
            // Three questions, each out of 10, so the round
            // is out of CODING_MAX_SCORE. A question that was
            // never submitted counts as 0.
            //
            // The score is picked per question id, exactly
            // like the candidate's own result screen does, so
            // a re-submitted question cannot be counted twice
            // and the total can never pass 30.
            // =============================================

            List<CodingSession> codingSessions =
                    codingSessionRepository
                            .findByApplicationId(
                                    application.getId()
                            );

            if (codingSessions != null &&
                    !codingSessions.isEmpty()) {

                CodingSession latestSession =
                        codingSessions.get(
                                codingSessions.size() - 1
                        );

                List<CodingSubmission> submissions =
                        codingSubmissionRepository
                                .findBySessionId(
                                        latestSession.getId()
                                );

                if (submissions != null &&
                        !submissions.isEmpty()) {

                    /*
                     * A session with submissions that carry no
                     * score at all stays unscored, so the
                     * recruiter sees "—" instead of a 0.
                     */
                    boolean anyScored = false;

                    for (CodingSubmission submission :
                            submissions) {

                        if (submission != null &&
                                submission.getScore() != null) {

                            anyScored = true;
                            break;
                        }
                    }

                    if (anyScored) {

                        double totalScore =
                                questionScore(
                                        submissions,
                                        latestSession.getQuestion1Id()
                                )
                                        + questionScore(
                                        submissions,
                                        latestSession.getQuestion2Id()
                                )
                                        + questionScore(
                                        submissions,
                                        latestSession.getQuestion3Id()
                                );

                        codingScore =
                                Math.round(
                                        totalScore * 100.0
                                ) / 100.0;
                    }
                }
            }

            // =============================================
            // FINAL SCORE
            //
            // Total of the three rounds, out of
            // FINAL_MAX_SCORE (10 + 50 + 30 = 90).
            //
            // A round the candidate has not finished counts
            // as 0, so the number keeps growing as the
            // candidate clears each round. It stays null only
            // while every round is unscored, so a brand new
            // application shows "—" and not a 0.
            // =============================================

            Double finalScore = null;

            boolean anyRoundScored =
                    resumeScore != null
                            || interviewScore != null
                            || codingScore != null;

            if (anyRoundScored) {

                double total = 0.0;

                if (resumeScore != null) {
                    total += resumeScore;
                }

                if (interviewScore != null) {
                    total += interviewScore;
                }

                if (codingScore != null) {
                    total += codingScore;
                }

                finalScore =
                        Math.round(
                                total * 100.0
                        ) / 100.0;
            }

            // =============================================
            // BUILD DTO
            // =============================================

            RecruiterApplicationResultDTO dto =
                    new RecruiterApplicationResultDTO();

            dto.setApplicationId(
                    application.getId()
            );

            dto.setJobId(
                    job.getId()
            );

            dto.setJobTitle(
                    job.getTitle()
            );

            if (candidate != null) {

                dto.setCandidateId(
                        candidate.getId()
                );

                dto.setCandidateName(
                        candidate.getName()
                );

                dto.setCandidateEmail(
                        candidate.getEmail()
                );
            }

            if (resume != null) {

                dto.setResumeId(
                        resume.getId()
                );

                dto.setResumeFileName(
                        resume.getFileName()
                );
            }

            dto.setResumeScore(
                    resumeScore
            );

            dto.setInterviewScore(
                    interviewScore
            );

            dto.setCodingScore(
                    codingScore
            );

            dto.setFinalScore(
                    finalScore
            );

            dto.setApplicationStatus(
                    application.getStatus()
            );

            if (application.getAppliedAt() != null) {

                dto.setAppliedAt(
                        application
                                .getAppliedAt()
                                .toString()
                );
            }

            results.add(dto);
        }

        return results;
    }

    // =====================================================
    // CODING SCORE OF ONE QUESTION
    //
    // Returns the score of the first scored submission that
    // belongs to this question, or 0 when the question was
    // never submitted or never scored.
    // =====================================================

    private double questionScore(
            List<CodingSubmission> submissions,
            Long questionId) {

        if (questionId == null) {
            return 0.0;
        }

        for (CodingSubmission submission : submissions) {

            if (submission == null) {
                continue;
            }

            if (submission.getScore() == null) {
                continue;
            }

            if (submission.getQuestion() == null) {
                continue;
            }

            if (submission.getQuestion().getId() == null) {
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