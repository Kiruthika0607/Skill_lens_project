package com.skilllens.career;
import lombok.*; import java.time.Instant;
@Data @Builder public class CareerRecommendationResponse {
    private Long id; private Long careerId; private double matchScore;
    private int matchedSkillCount; private int totalRequiredSkills;
    private String explanation; private Instant generatedAt;
    private String title; private String description; private String industry;
    private boolean profilePreferred;
}
