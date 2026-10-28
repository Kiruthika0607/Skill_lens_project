package com.skilllens.student;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudentProfileResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String phone;
    private String bio;
    private String headline;
    private String avatarUrl;

    private String institution;
    private String university; // alias for institution

    private String degree;
    private String department;
    private String major; // alias for department/degree

    private Integer graduationYear;
    private BigDecimal gpa;
    private BigDecimal gpaScale;
    private String preferredCareerRole;
    private String preferredLocations;
    private Boolean openToRemote;
    private Integer yearsOfExperience;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    private int profileCompletionPercent;
    private Integer profileCompletionPercentage; // frontend alias

    private Instant createdAt;
    private Instant updatedAt;
}
