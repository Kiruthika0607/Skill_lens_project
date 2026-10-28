package com.skilllens.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSummaryResponse {
    private Long id;
    private String title;
    private String description;
    private Long skillId;
    private String skillName;
    private String categoryName;
    private String difficulty;
    private Integer timeLimitMinutes;
    private Integer durationMinutes;
    private Integer questionCount;
    private Integer passingScore;
    private Boolean isResumeSkill;
    private Boolean isResumePersonalized;
}
