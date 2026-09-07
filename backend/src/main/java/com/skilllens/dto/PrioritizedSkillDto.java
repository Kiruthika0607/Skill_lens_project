package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrioritizedSkillDto {
    private Long skillId;
    private String skillName;
    private String categoryName;
    private String priority; // HIGH, MEDIUM, LOW
    private boolean required;
    private String reason; // Clear human-readable reason why this skill is prioritized
    private String demandLevel;
}
