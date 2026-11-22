package com.orderflow.notification.service;

public interface EmailService {
    void sendHtmlEmail(String to, String subject, String htmlBody);
}
