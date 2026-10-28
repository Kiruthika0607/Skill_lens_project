package com.skilllens.roadmap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapAssessmentResponse {
    private Long id;
    private String title;
    private Integer passingScore;
    private boolean passed;
}
