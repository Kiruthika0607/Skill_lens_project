package com.skilllens.skillgap;

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
public class SkillGapReport {
    private Long careerId;
    private String careerTitle;
    private Double overallGapPercentage;
    private int assessedSkillCount;
    private int selfReportedSkillCount;
    private int totalRequiredSkillCount;
    private int notAssessedCount;
    private List<SkillGapItem> gapItems;
    private String methodology;
    private Instant calculatedAt;
}
