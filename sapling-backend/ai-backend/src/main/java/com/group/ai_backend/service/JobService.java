package com.group.ai_backend.service;

import com.group.ai_backend.dto.JobRequest;
import com.group.ai_backend.entity.Job;
import com.group.ai_backend.entity.User;
import com.group.ai_backend.repository.JobRepository;
import com.group.ai_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // CREATE JOB
    // =========================

    public Job createJob(
            JobRequest request,
            String email) {

        User recruiter =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        if (!"RECRUITER".equalsIgnoreCase(
                recruiter.getRole())) {

            throw new RuntimeException(
                    "Only recruiters can create jobs"
            );
        }

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .skills(request.getSkills())
                .experience(request.getExperience())
                .createdAt(LocalDateTime.now())
                .active(true)
                .recruiter(recruiter)
                .build();

        return jobRepository.save(job);
    }

    // =========================
    // GET MY JOBS
    // =========================

    public List<Job> getMyJobs(String email) {

        return jobRepository
                .findByRecruiterEmail(email);
    }

    // =========================
    // GET ONE JOB
    // =========================

    public Job getMyJob(
            Long id,
            String email) {

        return jobRepository
                .findByIdAndRecruiterEmail(
                        id,
                        email
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found"
                        ));
    }

    // =========================
    // GET ACTIVE JOBS
    // FOR CANDIDATES
    // =========================

    public List<Job> getActiveJobs() {

        return jobRepository.findByActiveTrue();
    }

    // =========================
    // UPDATE JOB
    // =========================

    public Job updateMyJob(
            Long id,
            JobRequest request,
            String email) {

        Job job =
                getMyJob(id, email);

        job.setTitle(
                request.getTitle()
        );

        job.setDescription(
                request.getDescription()
        );

        job.setSkills(
                request.getSkills()
        );

        job.setExperience(
                request.getExperience()
        );

        return jobRepository.save(job);
    }

    // =========================
    // TOGGLE JOB STATUS
    // =========================

    public Job toggleJobStatus(
            Long id,
            String email) {

        Job job =
                getMyJob(id, email);

        job.setActive(
                !job.isActive()
        );

        return jobRepository.save(job);
    }

    // =========================
    // DELETE JOB
    // =========================

    public void deleteMyJob(
            Long id,
            String email) {

        Job job =
                getMyJob(id, email);

        jobRepository.delete(job);
    }
}