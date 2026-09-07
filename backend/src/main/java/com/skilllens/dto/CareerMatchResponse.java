package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerMatchResponse {
    private Long occupationId;
    private String occupationTitle;
    private String description;
    private String industryDemand;
    private double matchPercentage; // Overall weighted match
    private double readinessScore;   // Required skills readiness score
    private int matchedSkillCount;
    private int totalSkillCount;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<PrioritizedSkillDto> priorityGaps;
}
