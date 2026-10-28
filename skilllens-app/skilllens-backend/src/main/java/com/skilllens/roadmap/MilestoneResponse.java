package com.skilllens.roadmap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneResponse {
    private Long id;
    private Integer milestoneOrder;
    private String title;
    private String description;
    private Long targetSkillId;
    private String targetSkillName;
    private Integer targetProficiency;
    private MilestoneStatus status;
    private Integer estimatedWeeks;
    private Instant completedAt;
    private Instant createdAt;
    private List<RoadmapResourceResponse> learningResources;
    private List<RoadmapAssessmentResponse> assessments;
    private int completedResourceCount;
    private int requiredResourceCount;
    private boolean assessmentPassed;
    private boolean completionReady;
    private List<String> completionBlockers;
}
