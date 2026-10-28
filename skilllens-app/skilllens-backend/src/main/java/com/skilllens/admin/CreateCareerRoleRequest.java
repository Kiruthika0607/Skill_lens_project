package com.skilllens.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCareerRoleRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String industrySector;
    private Integer averageSalaryMin;
    private Integer averageSalaryMax;
    private String growthOutlook;

    private List<RequiredSkillInput> requiredSkills;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequiredSkillInput {
        private Long skillId;
        private Double weight;
        private Integer minProficiency;
    }
}
