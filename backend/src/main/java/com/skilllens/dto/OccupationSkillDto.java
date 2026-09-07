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
public class OccupationSkillDto {
    private Long skillId;
    private String skillName;
    private String categoryName;
    private BigDecimal weight;
    private boolean required;
    private String priorityLevel;
}
