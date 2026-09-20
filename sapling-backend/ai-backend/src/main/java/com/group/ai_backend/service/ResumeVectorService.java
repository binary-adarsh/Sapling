package com.group.ai_backend.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResumeVectorService {

    private final VectorStore vectorStore;

    public ResumeVectorService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void storeResume(
            Long resumeId,
            String resumeText,
            String email) {

        System.out.println("========== RAG START ==========");

        System.out.println(
                "Resume ID: " + resumeId
        );

        System.out.println(
                "Resume text length: " + resumeText.length()
        );

        List<Document> documents =
                createChunks(
                        resumeId,
                        resumeText,
                        email
                );

        System.out.println(
                "Chunks created: " + documents.size()
        );

        System.out.println(
                "Sending chunks to VectorStore..."
        );

        vectorStore.add(documents);

        System.out.println(
                "========== RAG STORED =========="
        );
    }

    private List<Document> createChunks(
            Long resumeId,
            String resumeText,
            String email) {

        List<Document> documents =
                new ArrayList<>();

        int chunkSize = 1000;
        int overlap = 200;

        int start = 0;
        int chunkNumber = 0;

        while (start < resumeText.length()) {

            int end =
                    Math.min(
                            start + chunkSize,
                            resumeText.length()
                    );

            String chunk =
                    resumeText.substring(
                            start,
                            end
                    );

            Document document =
                    new Document(chunk);

            document.getMetadata().put(
                    "resumeId",
                    resumeId
            );

            document.getMetadata().put(
                    "email",
                    email
            );

            document.getMetadata().put(
                    "chunkNumber",
                    chunkNumber
            );

            documents.add(document);

            chunkNumber++;

            if (end == resumeText.length()) {
                break;
            }

            start = end - overlap;
        }

        return documents;
    }
}