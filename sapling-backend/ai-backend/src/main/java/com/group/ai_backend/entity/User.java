package com.group.ai_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    private String password;

    private String role;

    // =====================================================
    // EMAIL VERIFICATION
    // =====================================================

    @Column(nullable = false)
    private boolean emailVerified = false;

    @JsonIgnore
    private String verificationOtp;

    @JsonIgnore
    private Long otpExpiry;

    // =====================================================
    // RESUMES
    // =====================================================

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Resume> resumes = new ArrayList<>();
}