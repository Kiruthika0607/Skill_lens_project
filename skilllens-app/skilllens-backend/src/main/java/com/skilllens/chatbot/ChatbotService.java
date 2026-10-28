package com.skilllens.chatbot;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.config.SkillLensProperties;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import com.skilllens.student.StudentProfile;
import com.skilllens.student.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final StudentProfileRepository profileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillLensProperties properties;
    private final ObjectMapper objectMapper;

    private static final OkHttpClient HTTP_CLIENT = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build();

    @Transactional
    public ChatConversationResponse createConversation(UserPrincipal principal, CreateConversationRequest request) {
        String title = (request != null && request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle()
                : "Career Advisory Discussion";

        ChatConversation conversation = ChatConversation.builder()
                .userId(principal.getId())
                .title(title)
                .build();

        conversation = conversationRepository.save(conversation);

        // Add welcome message from advisor
        ChatMessage welcome = ChatMessage.builder()
                .conversation(conversation)
                .senderType(ChatSenderType.ASSISTANT)
                .content("Hello! I am your SkillLens Career & Skills Advisor. I have access to your academic profile and assessed skills. How can I help guide your engineering career journey today?")
                .build();
        messageRepository.save(welcome);

        if (request != null && request.getInitialMessage() != null && !request.getInitialMessage().isBlank()) {
            sendMessage(principal, conversation.getId(), SendMessageRequest.builder().content(request.getInitialMessage()).build());
        }

        return mapToResponse(conversation);
    }

    @Transactional(readOnly = true)
    public List<ChatConversationResponse> getMyConversations(UserPrincipal principal) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(principal.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getConversationMessages(UserPrincipal principal, Long conversationId) {
        conversationRepository.findByIdAndUserId(conversationId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::mapMessageToResponse)
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(UserPrincipal principal, Long conversationId, SendMessageRequest request) {
        ChatConversation conversation = conversationRepository.findByIdAndUserId(conversationId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        // 1. Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .conversation(conversation)
                .senderType(ChatSenderType.USER)
                .content(request.getContent())
                .build();
        messageRepository.save(userMessage);

        // 2. Fetch context
        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(principal.getId());
        List<StudentSkill> skills = studentSkillRepository.findByUserId(principal.getId());

        // Only the student's current message is sent to a configured model provider.
        String replyText;
        boolean anthropicEnabled = properties.getAi() != null
                && "anthropic".equalsIgnoreCase(properties.getAi().getProvider())
                && properties.getAi().getAnthropic() != null
                && properties.getAi().getAnthropic().isEnabled()
                && properties.getAi().getAnthropic().getApiKey() != null
                && !properties.getAi().getAnthropic().getApiKey().isBlank();
        boolean geminiEnabled = properties.getAi() != null
                && "gemini".equalsIgnoreCase(properties.getAi().getProvider())
                && properties.getAi().getGemini() != null
                && properties.getAi().getGemini().isEnabled()
                && properties.getAi().getGemini().getApiKey() != null
                && !properties.getAi().getGemini().getApiKey().isBlank();

        if (geminiEnabled) {
            replyText = callGemini(request.getContent());
            if (replyText == null) {
                replyText = generateDomainResponse(request.getContent(), profileOpt.orElse(null), skills);
            }
        } else if (anthropicEnabled) {
            replyText = callAnthropicClaude(request.getContent());
            if (replyText == null) {
                replyText = generateDomainResponse(request.getContent(), profileOpt.orElse(null), skills);
            }
        } else {
            replyText = generateDomainResponse(request.getContent(), profileOpt.orElse(null), skills);
        }

        // 4. Save assistant response
        ChatMessage assistantMessage = ChatMessage.builder()
                .conversation(conversation)
                .senderType(ChatSenderType.ASSISTANT)
                .content(replyText)
                .build();
        messageRepository.save(assistantMessage);

        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        return mapMessageToResponse(assistantMessage);
    }

    @Transactional
    public void deleteConversation(UserPrincipal principal, Long conversationId) {
        ChatConversation conversation = conversationRepository.findByIdAndUserId(conversationId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));
        conversationRepository.delete(conversation);
    }

    private String callAnthropicClaude(String userMessage) {
        try {
            String apiKey = properties.getAi().getAnthropic().getApiKey();
            String model = properties.getAi().getAnthropic().getModel() != null
                    ? properties.getAi().getAnthropic().getModel()
                    : "claude-3-5-haiku-20241022";

            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("model", model);
            bodyMap.put("max_tokens", 1024);
            bodyMap.put("system", "You are SkillLens AI, a helpful general-purpose assistant and engineering career advisor. " +
                    "Answer the user's question directly and accurately. Be clear about uncertainty and do not invent facts.");

            List<Map<String, String>> messagesList = new ArrayList<>();
            messagesList.add(Map.of("role", "user", "content", userMessage));
            bodyMap.put("messages", messagesList);

            RequestBody body = RequestBody.create(
                    objectMapper.writeValueAsString(bodyMap),
                    MediaType.get("application/json; charset=utf-8"));

            Request request = new Request.Builder()
                    .url("https://api.anthropic.com/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .post(body)
                    .build();

            try (Response response = HTTP_CLIENT.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    JsonNode root = objectMapper.readTree(response.body().string());
                    JsonNode contentArr = root.get("content");
                    if (contentArr != null && contentArr.isArray() && !contentArr.isEmpty()) {
                        String answer = contentArr.get(0).path("text").asText();
                        return answer.isBlank() ? null : answer;
                    }
                    log.warn("Anthropic API returned an empty response; using local advisor fallback.");
                } else {
                    log.warn("Anthropic API returned status {}; using local advisor fallback.", response.code());
                }
            }
        } catch (Exception e) {
            log.warn("Anthropic API call failed: {}. Falling back to local advisor.", e.getMessage());
        }
        return null;
    }

    private String callGemini(String userMessage) {
        try {
            SkillLensProperties.Ai.Gemini gemini = properties.getAi().getGemini();
            Map<String, Object> bodyMap = Map.of(
                    "systemInstruction", Map.of("parts", List.of(Map.of("text",
                            "You are SkillLens AI, a helpful general-purpose assistant and engineering career advisor. " +
                                    "Answer the user's question directly and accurately. Be clear about uncertainty and do not invent facts."))),
                    "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage)))),
                    "generationConfig", Map.of("temperature", 0.6, "maxOutputTokens", 1024)
            );
            RequestBody body = RequestBody.create(
                    objectMapper.writeValueAsString(bodyMap),
                    MediaType.get("application/json; charset=utf-8"));
            Request request = new Request.Builder()
                    .url("https://generativelanguage.googleapis.com/v1beta/models/"
                            + gemini.getModel() + ":generateContent?key=" + gemini.getApiKey())
                    .header("content-type", "application/json")
                    .post(body)
                    .build();

            OkHttpClient client = HTTP_CLIENT.newBuilder()
                    .callTimeout(gemini.getTimeoutSeconds(), TimeUnit.SECONDS)
                    .build();
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful() && response.body() != null) {
                    JsonNode root = objectMapper.readTree(response.body().string());
                    JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        String answer = parts.get(0).path("text").asText();
                        return answer.isBlank() ? null : answer;
                    }
                    log.warn("Gemini API returned an empty response; using local advisor fallback.");
                } else {
                    log.warn("Gemini API returned status {}; using local advisor fallback.", response.code());
                }
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed: {}. Falling back to local advisor.", e.getMessage());
        }
        return null;
    }

    private String generateDomainResponse(String userQuery, StudentProfile profile, List<StudentSkill> skills) {
        String lower = userQuery.toLowerCase();

        List<String> assessedSkillNames = (skills != null) ? skills.stream()
                .filter(s -> s.getAssessedProficiency() != null && s.getAssessedProficiency() > 0)
                .map(s -> s.getSkill().getName())
                .toList() : List.of();

        if (lower.contains("resume") || lower.contains("cv")) {
            return "### 📄 Resume Optimization Advice\n\n" +
                   "Based on industry hiring standards, here is how you can optimize your engineering resume:\n\n" +
                   "1. **Highlight Assessed Skills**: Feature your highest-rated competencies prominently in a dedicated 'Technical Skills' section" +
                   (!assessedSkillNames.isEmpty() ? " (such as **" + String.join(", ", assessedSkillNames) + "**)" : "") + ".\n" +
                   "2. **Use the Google X-Y-Z Formula**: Structure project bullet points as *'Accomplished [X], as measured by [Y], by doing [Z]'*.\n" +
                   "3. **Upload to SkillLens**: Use our **Resume Upload** feature (`/api/resumes/upload`) to parse your document and automatically cross-reference your skills against open job opportunities!";
        }

        if (lower.contains("interview") || lower.contains("mock") || lower.contains("prepare")) {
            return "### 🎯 Technical Interview Preparation Strategy\n\n" +
                   "To ace technical and behavioral interviews for engineering roles:\n\n" +
                   "1. **Data Structures & Algorithms**: Practice core patterns (Two Pointers, Sliding Window, BFS/DFS, Dynamic Programming).\n" +
                   "2. **System Design & Architecture**: Understand caching, database indexing, horizontal scaling, and RESTful API principles.\n" +
                   "3. **STAR Method for Behavioral Questions**: Prepare scenarios showcasing ownership, debugging complex issues, and cross-team collaboration.\n" +
                   "4. **Check Our Learning Resources**: Explore curated tutorials and mock interview guides under the **Learning Resources** tab!";
        }

        if (lower.contains("roadmap") || lower.contains("career") || lower.contains("path") || lower.contains("role")) {
            return "### 🗺️ Personalized Career Roadmap Guidance\n\n" +
                   "Navigating towards your target career role requires structured milestone progression:\n\n" +
                   "1. **Identify Target Role**: Explore available roles (e.g. *Full Stack Developer*, *Backend Engineer*, *Cloud DevOps Architect*, *Data Scientist*).\n" +
                   "2. **Calculate Skill Gap**: Run our automated Skill Gap engine (`/api/skill-gaps/careers/{careerId}`) to see exactly which competencies need focus.\n" +
                   "3. **Generate Your Roadmap**: Click 'Generate Roadmap' to get a customized, ordered milestone path with curated study materials!";
        }

        if (lower.contains("opportunity") || lower.contains("job") || lower.contains("internship") || lower.contains("hackathon")) {
            return "### 💼 Engineering Opportunities & Application Tips\n\n" +
                   "SkillLens aggregates verified tech internships, full-time engineering roles, scholarships, and hackathons.\n\n" +
                   "- Check out **Matched Opportunities** (`/api/opportunities/matches`) to see roles scored directly against your verified skill proficiency.\n" +
                   "- Save exciting postings to your dashboard to track your application stages from applied to offer!";
        }

        return "### 💡 Career Guidance Insights\n\n" +
               "Thank you for your question! To maximize your career trajectory on SkillLens:\n\n" +
               "- **Take Skill Assessments**: Complete objective quizzes to establish verified proficiency ratings.\n" +
               "- **Bridge Gaps**: Follow your personalized milestone roadmaps and explore curated learning resources.\n" +
               "- **Apply With Confidence**: Check our real-time Opportunity Aggregator for roles tailored to your verified strengths.\n\n" +
               "Feel free to ask about specific skills, resume feedback, interview strategies, or career paths!";
    }

    private ChatConversationResponse mapToResponse(ChatConversation c) {
        return ChatConversationResponse.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .title(c.getTitle())
                .messageCount(c.getMessages() != null ? c.getMessages().size() : 0)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private ChatMessageResponse mapMessageToResponse(ChatMessage m) {
        return ChatMessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderType(m.getSenderType())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
