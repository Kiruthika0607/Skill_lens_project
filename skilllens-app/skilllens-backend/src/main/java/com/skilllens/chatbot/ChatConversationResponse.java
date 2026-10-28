package com.skilllens.chatbot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationResponse {
    private Long id;
    private Long userId;
    private String title;
    private Integer messageCount;
    private Instant createdAt;
    private Instant updatedAt;
}
