package com.orderflow.common.event;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public abstract class BaseEvent {

    private String eventId;
    private String eventType;
    private String aggregateId;
    private String aggregateType;
    private Instant timestamp;
    private int version;
    private String correlationId;
    private String source;

    public void initDefaults(String eventType, String aggregateId, String aggregateType, String source, String correlationId) {
        if (this.eventId == null) {
            this.eventId = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
        if (this.version <= 0) {
            this.version = 1;
        }
        this.eventType = eventType;
        this.aggregateId = aggregateId;
        this.aggregateType = aggregateType;
        this.source = source;
        this.correlationId = correlationId;
    }
}
