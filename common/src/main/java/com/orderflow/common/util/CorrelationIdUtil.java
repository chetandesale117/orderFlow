package com.orderflow.common.util;

import org.slf4j.MDC;

import java.util.UUID;

public final class CorrelationIdUtil {

    public static final String MDC_KEY = "correlationId";
    public static final String HEADER_NAME = "X-Correlation-ID";

    private CorrelationIdUtil() {}

    public static String getOrGenerate(String existingId) {
        if (existingId != null && !existingId.trim().isEmpty()) {
            return existingId.trim();
        }
        return UUID.randomUUID().toString();
    }

    public static void setCorrelationId(String correlationId) {
        MDC.put(MDC_KEY, correlationId);
    }

    public static String getCorrelationId() {
        return MDC.get(MDC_KEY);
    }

    public static void clear() {
        MDC.remove(MDC_KEY);
    }
}
