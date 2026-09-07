package com.skilllens.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddSkillRequest {
    @NotBlank(message = "Skill name is required")
    private String skillName; // can be an alias, e.g. "JS", "ReactJS", "ML"

    @Builder.Default
    private String proficiencyLevel = "INTERMEDIATE"; // BEGINNER, INTERMEDIATE, ADVANCED

    @Builder.Default
    private BigDecimal yearsExperience = BigDecimal.ZERO;
}
