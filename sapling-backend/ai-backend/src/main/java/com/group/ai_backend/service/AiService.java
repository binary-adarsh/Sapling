package com.group.ai_backend.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AiService {

    private final ChatClient chatClient;

    public AiService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }


    // =====================================================
    // 1. RESUME ANALYSIS
    // =====================================================

    public Flux<String> analyzeResume(String resumeText) {

        String prompt = """
                Analyze this resume as a strict technical recruiter.

                Give exactly these sections:

                1. Candidate Name
                2. Skills
                3. Education
                4. Experience
                5. Projects
                6. Strengths
                7. Weaknesses
                8. Resume Score /10: [number]
                9. Top 3 Improvements

                Rules:
                - Judge only the information actually present.
                - Do not assume missing skills or experience.
                - Keep each section concise.
                - Use bullet points.
                - Maximum 200 words.
                - Score must be between 0 and 10.
                - Decimal scores are allowed.
                - Use a realistic score.
                - Do not automatically give 10.
                - Example:
                  Resume Score /10: 8.75
                - If information is missing, write "Not mentioned".

                Resume:
                %s
                """.formatted(resumeText);

        return chatClient
                .prompt()
                .user(prompt)
                .stream()
                .content();
    }


    // =====================================================
    // 2. RESUME - JOB DESCRIPTION MATCHING
    // =====================================================

    public Flux<String> matchResumeWithJob(
            String resumeText,
            String jobDescription) {

        String prompt = """
                Compare this resume with the given job description
                as a strict technical recruiter.

                Give exactly these sections:

                1. Match Score /10: [number]
                2. Matching Skills
                3. Missing Skills
                4. Relevant Experience
                5. Strengths
                6. Recommendation

                Rules:
                - Judge only the actual resume.
                - Do not assume skills that are not mentioned.
                - Missing important skills must reduce the score.
                - Relevant experience must be considered.
                - Score must be between 0 and 10.
                - Decimal scores are allowed.
                - Do not automatically give a high score.
                - Example:
                  Match Score /10: 8.75
                - Maximum 200 words.
                - If something is missing, write "Not mentioned".

                RESUME:
                %s

                JOB DESCRIPTION:
                %s
                """.formatted(
                resumeText,
                jobDescription
        );

        return chatClient
                .prompt()
                .user(prompt)
                .stream()
                .content();
    }


    // =====================================================
    // 3. ASK QUESTION FROM RESUME - RAG
    // =====================================================

    public String askResumeQuestion(
            String context,
            String question) {

        String prompt = """
                You are an AI assistant analyzing a user's resume.

                Answer the user's question using ONLY the resume
                information provided in the context below.

                If the answer is not present in the context,
                clearly say that the information is not available
                in the resume.

                Do not invent information.

                Resume Context:
                %s

                User Question:
                %s

                Give a clear and concise answer.
                """.formatted(
                context,
                question
        );

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }


    // =====================================================
    // 4. GENERATE AI INTERVIEW QUESTION
    // =====================================================

    public String generateInterviewQuestion(String prompt) {

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }


    // =====================================================
    // 5. EVALUATE INTERVIEW ANSWER
    // =====================================================

    public String evaluateInterviewAnswer(
            String resumeText,
            String jobDescription,
            String question,
            String answer) {

        String prompt = """
                You are a STRICT senior technical interviewer.

                Evaluate ONLY the candidate's actual answer.

                Candidate Resume:
                %s

                Job Description:
                %s

                Interview Question:
                %s

                Candidate Answer:
                %s

                Evaluate based on:

                1. Technical correctness
                2. Relevance
                3. Completeness
                4. Understanding
                5. Communication

                Return exactly:

                SCORE: [number]

                FEEDBACK:
                [concise feedback]

                Rules:
                - Score must be between 0 and 10.
                - Decimal scores are allowed.
                - Do not automatically give 10.
                - Fully correct answers can receive 9-10.
                - Mostly correct answers should receive 7-8.9.
                - Partially correct answers should receive 4-6.9.
                - Incorrect answers should receive 0-3.9.
                - Mention important missing points.
                - Do not generate another question.
                - Judge only the submitted answer.
                """.formatted(
                resumeText,
                jobDescription,
                question,
                answer
        );

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }


    // =====================================================
    // 6. GENERATE NEXT INTERVIEW QUESTION
    // =====================================================

    public String generateNextInterviewQuestion(
            String resumeText,
            String jobDescription,
            String previousQuestion,
            String previousAnswer,
            String previousFeedback,
            int questionNumber) {

        String prompt = """
                You are conducting a technical interview.

                Candidate Resume:
                %s

                Job Description:
                %s

                Previous Question:
                %s

                Candidate Answer:
                %s

                Previous Evaluation:
                %s

                Generate the next technical interview question.

                This is question number %d of 5.

                Rules:
                - Ask exactly ONE question.
                - Do not provide the answer.
                - Do not explain.
                - Make it relevant to the resume and job.
                - Consider previous performance.
                - Do not repeat the previous question.
                - Adapt difficulty according to previous performance.
                - Keep the question clear and concise.
                """.formatted(
                resumeText,
                jobDescription,
                previousQuestion,
                previousAnswer,
                previousFeedback,
                questionNumber
        );

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }


    // =====================================================
    // 7. STRICT CODING SOLUTION EVALUATION
    // =====================================================

    public String evaluateCodingSolution(
            String question,
            String code) {

        String prompt = """
                You are a STRICT senior software engineer
                conducting a coding interview.

                Evaluate the candidate's SUBMITTED CODE against
                the EXACT CODING QUESTION.

                =====================================================
                CODING QUESTION
                =====================================================

                %s

                =====================================================
                CANDIDATE SUBMITTED CODE
                =====================================================

                %s

                =====================================================
                IMPORTANT
                =====================================================

                Judge ONLY the code that was submitted.

                NEVER mentally fix the candidate's code.

                NEVER assume missing code exists.

                NEVER evaluate a corrected version.

                The score must be based on the EXACT submitted code.

                =====================================================
                STEP 1 - QUESTION MATCHING
                =====================================================

                First determine whether the submitted code actually
                attempts to solve the given question.

                If the question asks:

                "Reverse a singly linked list"

                but the candidate submits:

                "Two Sum"

                then the solution is WRONG.

                Do NOT give credit simply because the submitted code
                correctly solves another problem.

                Wrong problem:
                MAXIMUM SCORE = 2.0

                =====================================================
                STEP 2 - COMPILATION CHECK
                =====================================================

                Carefully check the submitted code for:

                - Undeclared variables
                - Missing declarations
                - Missing methods
                - Missing brackets
                - Missing braces
                - Missing parentheses
                - Invalid syntax
                - Invalid return type
                - Incompatible return value
                - Invalid Java statements
                - Other obvious compilation problems

                If there is an obvious compilation error:

                MAXIMUM SCORE = 3.0

                IMPORTANT:

                Do NOT say that the code is correct just because
                one small declaration could fix it.

                Example:

                int x = y;

                where y is never declared.

                This is a compilation error.

                The candidate submitted invalid code.

                Score it accordingly.

                =====================================================
                STEP 3 - LOGIC CHECK
                =====================================================

                Check:

                - Algorithm correctness
                - Conditions
                - Loops
                - Variables
                - Return value
                - Data structures
                - Edge cases
                - Whether the algorithm actually solves the question

                Do not assume the candidate intended something different.

                =====================================================
                STEP 4 - COMPLETENESS
                =====================================================

                If the method is incomplete:

                MAXIMUM SCORE = 4.0

                Examples:

                Missing return statement
                Missing required logic
                Empty method
                Incomplete loop
                Missing required code

                =====================================================
                STEP 5 - WRONG RETURN VALUE
                =====================================================

                If the algorithm is mostly correct but the final
                return value is wrong:

                MAXIMUM SCORE = 7.0

                Example:

                Correctly reverses a linked list but returns:

                return head;

                instead of:

                return prev;

                This is NOT a 9 or 10.

                =====================================================
                SCORING
                =====================================================

                9.50 - 10.00
                Completely correct, compilable, complete and efficient.

                9.00 - 9.49
                Correct solution with an extremely minor issue.

                8.00 - 8.99
                Correct overall solution with a small issue.

                7.00 - 7.99
                Mostly correct but contains a meaningful issue.

                5.00 - 6.99
                Partially correct approach with significant problems.

                3.00 - 4.99
                Major problems but some relevant logic exists.

                1.00 - 2.99
                Very little correct logic, major errors,
                incomplete implementation or compilation problems.

                0.00 - 0.99
                Empty, unrelated, completely incorrect,
                or unusable solution.

                =====================================================
                HARD SCORE LIMITS
                =====================================================

                Compilation error:
                MAXIMUM = 3.0

                Wrong problem:
                MAXIMUM = 2.0

                Empty code:
                MAXIMUM = 0.0

                Completely unrelated code:
                MAXIMUM = 1.0

                Incomplete solution:
                MAXIMUM = 4.0

                Wrong final return value:
                MAXIMUM = 7.0

                =====================================================
                SCORE DISCIPLINE
                =====================================================

                NEVER automatically give 10.

                NEVER automatically give 9.

                Do NOT use 9.76 for a solution containing
                a real compilation or correctness error.

                Decimal scores should be used only when justified.

                Examples:

                Perfect solution:
                10.0

                Correct with tiny issue:
                9.25

                Mostly correct:
                8.25

                Minor logical bug:
                7.25

                Significant bug:
                5.50

                Compilation error:
                2.50

                Wrong problem:
                1.00

                =====================================================
                TIME COMPLEXITY
                =====================================================

                Calculate the complexity of the ACTUAL submitted code.

                Do not calculate complexity for a corrected version.

                =====================================================
                SPACE COMPLEXITY
                =====================================================

                Calculate the space complexity of the ACTUAL submitted code.

                Do not calculate complexity for a corrected version.

                =====================================================
                DO NOT REPAIR CODE
                =====================================================

                You may explain what is wrong.

                You may mention what needs to be fixed.

                BUT DO NOT provide corrected code.

                Do not increase the score because the fix is easy.

                =====================================================
                REQUIRED RESPONSE FORMAT
                =====================================================

                Score /10: [number]

                Correctness:
                [brief accurate explanation]

                Time Complexity:
                [complexity and brief explanation]

                Space Complexity:
                [complexity and brief explanation]

                Feedback:
                [brief overall feedback]

                Do not include corrected code.

                Do not generate a replacement solution.

                The score MUST be between 0 and 10.

                Use decimal scores only when justified.

                =====================================================
                FINAL VERIFICATION
                =====================================================

                Before assigning the score, verify:

                1. Does the code solve the exact question?
                2. Does the code compile?
                3. Are all variables declared?
                4. Are required methods present?
                5. Are return values correct?
                6. Are conditions correct?
                7. Is the algorithm correct?
                8. Are important edge cases handled?
                9. Is the complexity reasonable?
                10. Is the submitted code complete?

                ONLY AFTER CHECKING ALL OF THESE,
                assign the final score.
                """.formatted(
                question,
                code
        );

        return chatClient
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}