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
public class SkillGapAnalysisResponse {
    private Long targetOccupationId;
    private String targetOccupationTitle;
    private double careerReadinessScore;
    private double careerMatchScore;
    private int currentSkillCount;
    private int matchedSkillCount;
    private int missingSkillCount;
    private List<String> currentSkills;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<PrioritizedSkillDto> highPrioritySkills;
    private List<PrioritizedSkillDto> mediumPrioritySkills;
    private List<PrioritizedSkillDto> lowPrioritySkills;
}
