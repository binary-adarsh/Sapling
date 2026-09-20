package com.group.ai_backend.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResumeRagService {

    private final VectorStore vectorStore;
    private final AiService aiService;

    public ResumeRagService(
            VectorStore vectorStore,
            AiService aiService) {

        this.vectorStore = vectorStore;
        this.aiService = aiService;
    }

    public String askQuestion(
            String question,
            String email,
            Long resumeId) {

        // ==========================================
        // 1. Debug Information
        // ==========================================

        System.out.println("=================================");
        System.out.println("RAG QUESTION: " + question);
        System.out.println("RAG EMAIL: " + email);
        System.out.println("RAG RESUME ID: " + resumeId);
        System.out.println("=================================");

        // ==========================================
        // 2. PGVector Metadata Filter
        // ==========================================

        String filter =
                "email == '" + email + "'" +
                        " && resumeId == " + resumeId;

        System.out.println("RAG FILTER: " + filter);

        // ==========================================
        // 3. Similarity Search
        // ==========================================

        List<Document> documents =
                vectorStore.similaritySearch(
                        SearchRequest.builder()
                                .query(question)
                                .topK(5)
                                .filterExpression(filter)
                                .build()
                );

        // ==========================================
        // 4. Debug Retrieved Documents
        // ==========================================

        System.out.println(
                "RETRIEVED DOCUMENTS: "
                        + documents.size()
        );

        for (Document document : documents) {

            System.out.println("---------------------------------");

            System.out.println(
                    "Metadata: "
                            + document.getMetadata()
            );

            System.out.println(
                    "Content: "
                            + document.getText()
            );
        }

        System.out.println("=================================");

        // ==========================================
        // 5. No Relevant Documents
        // ==========================================

        if (documents.isEmpty()) {

            return "I could not find relevant information in your resume.";
        }

        // ==========================================
        // 6. Combine Retrieved Chunks
        // ==========================================

        StringBuilder context =
                new StringBuilder();

        for (Document document : documents) {

            context
                    .append(document.getText())
                    .append("\n\n");
        }

        // ==========================================
        // 7. Send Context + Question to AI
        // ==========================================

        return aiService.askResumeQuestion(
                context.toString(),
                question
        );
    }
}