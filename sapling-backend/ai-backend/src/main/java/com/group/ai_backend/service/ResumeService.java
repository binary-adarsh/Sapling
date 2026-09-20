package com.group.ai_backend.service;

import com.group.ai_backend.dto.ResumeStatsResponse;
import com.group.ai_backend.entity.Resume;
import com.group.ai_backend.entity.User;
import com.group.ai_backend.repository.ResumeRepository;
import com.group.ai_backend.repository.UserRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.group.ai_backend.entity.JobMatch;
import com.group.ai_backend.repository.JobMatchRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JobMatchRepository jobMatchRepository;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository, JobMatchRepository jobMatchRepository) {

        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.jobMatchRepository = jobMatchRepository;
    }

    public String extractText(MultipartFile file) throws Exception {

        PDDocument document =
                Loader.loadPDF(file.getBytes());

        PDFTextStripper stripper =
                new PDFTextStripper();

        String text =
                stripper.getText(document);

        document.close();

        return text;
    }

    public Resume saveResume(
            MultipartFile file,
            String resumeText,
            String aiAnalysis,
            String email) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found with email: "
                                                + email
                                ));

        Double score =
                extractScore(aiAnalysis);

        Resume resume =
                Resume.builder()
                        .fileName(file.getOriginalFilename())
                        .resumeText(resumeText)
                        .aiAnalysis(aiAnalysis)
                        .score(score)
                        .createdAt(LocalDateTime.now())
                        .user(user)
                        .build();

        return resumeRepository.save(resume);
    }

    private Double extractScore(String aiAnalysis) {

        Pattern pattern =
                Pattern.compile(
                        "Resume Score\\s*/\\s*10\\s*:?\\s*(\\d+(?:\\.\\d+)?)",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher matcher =
                pattern.matcher(aiAnalysis);

        if (matcher.find()) {

            return Double.parseDouble(
                    matcher.group(1)
            );
        }

        return null;
    }

    public List<Resume> getMyResumes(String email) {

        return resumeRepository
                .findByUserEmail(email);
    }

    public Resume getMyResumeById(
            Long id,
            String email) {

        return resumeRepository
                .findByIdAndUserEmail(id, email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Resume not found with id: "
                                        + id
                        ));
    }

    public void deleteMyResume(
            Long id,
            String email) {

        Resume resume =
                resumeRepository
                        .findByIdAndUserEmail(id, email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found with id: "
                                                + id
                                ));

        resumeRepository.delete(resume);
    }

    public ResumeStatsResponse getMyResumeStats(
            String email) {

        long totalResumes =
                resumeRepository
                        .countByUserEmail(email);

        Double averageScore =
                resumeRepository
                        .findAverageScoreByUserEmail(email);

        Double bestScore =
                resumeRepository
                        .findMaxScoreByUserEmail(email);

        if (averageScore == null) {
            averageScore = 0.0;
        }

        if (bestScore == null) {
            bestScore = 0.0;
        }

        return new ResumeStatsResponse(
                totalResumes,
                Math.round(averageScore * 100.0) / 100.0,
                bestScore
        );
    }
    public JobMatch saveJobMatch(
            Resume resume,
            String jobDescription,
            String matchAnalysis,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        ));

        Double matchScore = extractMatchScore(matchAnalysis);

        JobMatch jobMatch = JobMatch.builder()
                .jobDescription(jobDescription)
                .matchAnalysis(matchAnalysis)
                .matchScore(matchScore)
                .createdAt(LocalDateTime.now())
                .resume(resume)
                .user(user)
                .build();

        return jobMatchRepository.save(jobMatch);
    }

    private Double extractMatchScore(String matchAnalysis) {

        Pattern pattern = Pattern.compile(
                "Match Score\\s*/\\s*10\\s*:?\\s*(\\d+(?:\\.\\d+)?)",
                Pattern.CASE_INSENSITIVE
        );

        Matcher matcher = pattern.matcher(matchAnalysis);

        if (matcher.find()) {
            return Double.parseDouble(matcher.group(1));
        }

        return null;
    }
}