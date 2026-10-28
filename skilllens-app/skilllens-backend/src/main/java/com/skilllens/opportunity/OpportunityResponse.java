package com.skilllens.opportunity;

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
public class OpportunityResponse {
    private Long id;
    private String title;
    private String organization;
    private OpportunityType opportunityType;
    private String location;
    private Boolean isRemote;
    private String employmentType;
    private String experienceLevel;
    private Integer salaryMin;
    private Integer salaryMax;
    private String stipend;
    private String applicationUrl;
    private Instant deadline;
    private String description;
    private String requirementsText;
    private String source;
    private Boolean isActive;
    private List<OpportunitySkillDto> requiredSkills;
    private Boolean isSaved;
    private ApplicationStatus applicationStatus;
    private Instant createdAt;
}
