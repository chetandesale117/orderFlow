package com.orderflow.notification.service.impl;

import com.orderflow.notification.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        log.info("Sending HTML email to: {} with subject: {}", to, subject);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("no-reply@orderflow.internal");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Successfully dispatched email to: {}", to);
        } catch (Exception e) {
            log.warn("Failed to dispatch email via SMTP (Mailpit may be starting up): {}", e.getMessage());
            throw new RuntimeException("Email delivery failed", e);
        }
    }
}
