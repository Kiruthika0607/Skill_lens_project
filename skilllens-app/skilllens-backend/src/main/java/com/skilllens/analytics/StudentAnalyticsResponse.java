package com.skilllens.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnalyticsResponse {
    private Long userId;
    private long assessedSkillsCount;
    private long totalSkillsTracked;
    private double averageProficiency;
    private long assessmentsTakenCount;
    private long completedRoadmapsCount;
    private long activeRoadmapsCount;
    private long savedOpportunitiesCount;
    private long appliedOpportunitiesCount;
    private Map<String, Integer> proficiencyDistribution; // Level 1..5 -> count
    private Map<String, Long> skillsByCategory;
    private Double careerReadinessScore;
    private String targetCareerTitle;
    private Double roadmapProgressPercentage;
    private long completedMilestones;
    private long totalMilestones;
    private Double assessmentPassRate;
    private long assessmentsAttempted;
    private long assessmentsPassed;
    private long verifiedSkillsCount;
    private long expertSkillsCount;
    private long advancedSkillsCount;
    private long intermediateSkillsCount;
    private long beginnerSkillsCount;
    private List<CriticalSkillGap> criticalSkillGaps;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CriticalSkillGap {
        private String skillName;
        private int currentLevel;
        private int requiredLevel;
        private double gapPercentage;
    }
}
