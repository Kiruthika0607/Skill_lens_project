package com.skilllens.skillgap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapItem {
    private Long skillId;
    private String skillName;
    private Integer requiredProficiency;
    private Integer assessedProficiency;
    private Integer currentProficiency;
    private String proficiencySource;
    private Double weight;
    private Double normalizedGap;
    private String assessmentStatus;
}
