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
public class RoadmapResponse {
    private Long id;
    private Long userId;
    private Long careerRoleId;
    private String careerRoleTitle;
    private String title;
    private String description;
    private Integer totalMilestones;
    private Integer completedMilestones;
    private Double completionPercentage;
    private RoadmapStatus status;
    private List<MilestoneResponse> milestones;
    private Instant createdAt;
    private Instant updatedAt;
}
