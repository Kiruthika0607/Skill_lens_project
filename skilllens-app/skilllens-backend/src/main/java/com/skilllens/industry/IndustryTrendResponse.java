package com.skilllens.industry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IndustryTrendResponse {
    private Long id;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private String industrySector;
    private Double demandScore;
    private Double growthRatePercent;
    private Integer averageSalaryMin;
    private Integer averageSalaryMax;
    private Integer jobPostingsCount;
    private String topLocations;
    private Integer year;
    private String quarter;
    private Instant updatedAt;
}
