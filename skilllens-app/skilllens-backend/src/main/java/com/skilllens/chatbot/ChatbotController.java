package com.skilllens.chatbot;

import com.skilllens.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "AI Career Chatbot", description = "Context-aware AI career counseling, resume advice, and interview guidance")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/conversations")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start a new career advisory conversation thread")
    public ResponseEntity<ChatConversationResponse> createConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) CreateConversationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chatbotService.createConversation(principal, request));
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get all chat conversation threads for the current student")
    public ResponseEntity<List<ChatConversationResponse>> getMyConversations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(chatbotService.getMyConversations(principal));
    }

    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get full message history for a conversation")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatbotService.getConversationMessages(principal, id));
    }

    @PostMapping("/conversations/{id}/messages")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Send a message to the AI career advisor and receive guidance")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(chatbotService.sendMessage(principal, id, request));
    }

    @GetMapping({"/history", "/messages"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get recent chat history for the authenticated student")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ChatConversationResponse> convs = chatbotService.getMyConversations(principal);
        if (convs.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(chatbotService.getConversationMessages(principal, convs.get(0).getId()));
    }

    @PostMapping("/messages")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Send a message to the AI career advisor")
    public ResponseEntity<ChatMessageResponse> sendDirectMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody java.util.Map<String, Object> body) {
        String content = (String) body.get("message");
        if (content == null || content.isBlank()) {
            content = (String) body.get("content");
        }
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Object convIdObj = body.get("conversationId");
        Long conversationId = null;
        if (convIdObj instanceof Number) {
            conversationId = ((Number) convIdObj).longValue();
        } else if (convIdObj instanceof String && !((String) convIdObj).isBlank()) {
            try {
                conversationId = Long.parseLong((String) convIdObj);
            } catch (NumberFormatException ignored) {}
        }

        if (conversationId == null) {
            List<ChatConversationResponse> convs = chatbotService.getMyConversations(principal);
            if (!convs.isEmpty()) {
                conversationId = convs.get(0).getId();
            } else {
                ChatConversationResponse newConv = chatbotService.createConversation(principal, null);
                conversationId = newConv.getId();
            }
        }

        return ResponseEntity.ok(chatbotService.sendMessage(
                principal,
                conversationId,
                SendMessageRequest.builder().content(content).build()));
    }

    @DeleteMapping("/conversations/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete a conversation thread")
    public ResponseEntity<Void> deleteConversation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        chatbotService.deleteConversation(principal, id);
        return ResponseEntity.noContent().build();
    }
}
