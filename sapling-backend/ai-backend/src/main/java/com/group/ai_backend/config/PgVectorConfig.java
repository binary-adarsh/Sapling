package com.group.ai_backend.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
public class PgVectorConfig {

    @Bean
    public JdbcTemplate ragJdbcTemplate() {

        DriverManagerDataSource dataSource =
                new DriverManagerDataSource();

        dataSource.setDriverClassName(
                "org.postgresql.Driver"
        );

        dataSource.setUrl(
                "jdbc:postgresql://localhost:5432/ai_rag"
        );

        dataSource.setUsername("postgres");

        dataSource.setPassword("postgres");

        return new JdbcTemplate(dataSource);
    }


    @Bean
    public VectorStore vectorStore(
            EmbeddingModel embeddingModel,
            JdbcTemplate ragJdbcTemplate) {

        return PgVectorStore
                .builder(
                        ragJdbcTemplate,
                        embeddingModel
                )
                .dimensions(768)
                .distanceType(
                        PgVectorStore.PgDistanceType.COSINE_DISTANCE
                )
                .indexType(
                        PgVectorStore.PgIndexType.HNSW
                )
                .initializeSchema(true)
                .schemaName("public")
                .vectorTableName("vector_store")
                .build();
    }
}