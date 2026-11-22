package com.orderflow.auth.messaging.event;

import com.orderflow.common.event.BaseEvent;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserRegisteredEvent extends BaseEvent {

    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
}
