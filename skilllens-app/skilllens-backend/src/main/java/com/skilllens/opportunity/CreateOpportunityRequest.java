package com.skilllens.opportunity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateOpportunityRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Organization is required")
    private String organization;

    @NotNull(message = "Opportunity type is required")
    private OpportunityType opportunityType;

    private String location;
    private Boolean isRemote;
    private String employmentType;
    private String experienceLevel;
    private Integer salaryMin;
    private Integer salaryMax;
    private String stipend;

    @NotBlank(message = "Application URL is required")
    private String applicationUrl;

    private Instant deadline;
    private String description;
    private String requirementsText;
    private String source;
    private List<Long> requiredSkillIds;
}
