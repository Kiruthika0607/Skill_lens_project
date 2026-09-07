package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationDetailDto {
    private Long id;
    private String title;
    private String description;
    private String careerLevel;
    private String averageSalary;
    private String industryDemand;
    private List<OccupationSkillDto> skills;
}
