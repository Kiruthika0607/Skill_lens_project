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
public class StudentSkillDto {
    private Long id;
    private Long skillId;
    private String skillName;
    private String categoryName;
    private String proficiencyLevel;
    private BigDecimal yearsExperience;
}
