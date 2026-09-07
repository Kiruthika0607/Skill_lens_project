package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendDto {
    private Long skillId;
    private String skillName;
    private String categoryName;
    private int jobMentionCount;
    private BigDecimal demandPercentage;
    private String trendDirection; // GROWING, EMERGING, STABLE, DECLINING
    private BigDecimal growthRate;
}
