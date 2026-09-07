package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapItemDto {
    private Long id;
    private Long skillId;
    private String skillName;
    private String categoryName;
    private int phaseNumber;
    private String phaseName;
    private String priorityLevel;
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED
    private String recommendedResource;
}
