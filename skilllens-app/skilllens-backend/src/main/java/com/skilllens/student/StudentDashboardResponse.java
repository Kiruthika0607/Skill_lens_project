package com.skilllens.student;

import com.skilllens.assessment.AttemptResultResponse;
import com.skilllens.opportunity.OpportunityMatchResponse;
import com.skilllens.resource.ResourceResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {
    // Legacy top-level fields
    private Integer profileCompletion;
    private Long assessedSkillCount;
    private Long careerRecommendationCount;
    private Long activeRoadmapMilestones;
    private Long completedRoadmapMilestones;
    private List<AttemptResultResponse> recentAssessmentResults;
    private List<ResourceResponse> recommendedResources;
    private List<OpportunityMatchResponse> recommendedOpportunities;

    // Rich frontend DashboardPage model fields
    private DashboardProfileDto profile;
    private TargetCareerDto targetCareer;
    private SkillOverviewDto skillOverview;
    private SkillGapSummaryDto skillGapSummary;
    private ActiveRoadmapDto activeRoadmap;
    private List<DashboardAssessmentDto> recentAssessments;
    private List<DashboardDeadlineDto> upcomingDeadlines;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardProfileDto {
        private String firstName;
        private String lastName;
        private String university;
        private String major;
        private Integer profileCompletionPercentage;
        private Boolean hasResume;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TargetCareerDto {
        private Long id;
        private String title;
        private Double matchPercentage;
        private Integer matchedSkillsCount;
        private Integer totalSkillsCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SkillOverviewDto {
        private Integer totalSkills;
        private Integer verifiedSkills;
        private Integer expertCount;
        private Integer advancedCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SkillGapSummaryDto {
        private String targetCareerTitle;
        private Double overallReadinessScore;
        private Integer totalGapCount;
        private List<CriticalGapSkillDto> criticalGapSkills;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CriticalGapSkillDto {
        private String skillName;
        private Integer currentLevel;
        private Integer requiredLevel;
        private Double gapPercentage;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ActiveRoadmapDto {
        private Long id;
        private String title;
        private Integer progressPercentage;
        private String nextMilestoneTitle;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardAssessmentDto {
        private Long id;
        private String title;
        private Integer score;
        private Integer maxScore;
        private Boolean passed;
        private Integer assessedProficiency;
        private String submittedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardDeadlineDto {
        private Long id;
        private String title;
        private String organization;
        private String type;
        private String deadline;
    }
}
