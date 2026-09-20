package com.group.ai_backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(
            JavaMailSender mailSender) {

        this.mailSender = mailSender;
    }

    // =====================================================
    // SEND OTP
    // =====================================================

    public void sendVerificationOtp(
            String to,
            String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(to);

        message.setSubject(
                "HireAI - Email Verification OTP"
        );

        message.setText(
                "Hello,\n\n" +

                        "Welcome to HireAI.\n\n" +

                        "Your email verification OTP is:\n\n" +

                        otp + "\n\n" +

                        "This OTP is valid for 5 minutes.\n\n" +

                        "If you did not create an account, " +
                        "please ignore this email.\n\n" +

                        "Regards,\n" +
                        "HireAI Team"
        );

        mailSender.send(message);
    }
}