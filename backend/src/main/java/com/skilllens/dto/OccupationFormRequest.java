package com.skilllens.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationFormRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String careerLevel;
    private String averageSalary;
    private String industryDemand;

    private List<OccupationSkillRequirement> skillRequirements;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OccupationSkillRequirement {
        private Long skillId;
        private BigDecimal weight;
        private boolean required;
        private String priorityLevel;
    }
}
