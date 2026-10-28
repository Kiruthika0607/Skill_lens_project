package com.skilllens.student;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateProfileRequest {

    @Size(max = 100) private String firstName;
    @Size(max = 100) private String lastName;
    @Size(max = 20)  private String phone;
    @Size(max = 2000) private String bio;
    @Size(max = 255) private String headline;

    @Size(max = 255) private String institution;
    @Size(max = 255) private String university; // Frontend alias for institution

    @Size(max = 100) private String degree;
    @Size(max = 200) private String department;
    @Size(max = 200) private String major; // Frontend alias for department/degree

    @Min(1980) @Max(2050)
    private Integer graduationYear;

    @DecimalMin("0.0") @DecimalMax("10.0")
    private BigDecimal gpa;

    @DecimalMin("4.0") @DecimalMax("10.0")
    private BigDecimal gpaScale;

    @Size(max = 200) private String preferredCareerRole;
    @Size(max = 1000) private String preferredLocations;
    private Boolean openToRemote;

    @Min(0) @Max(50)
    private Integer yearsOfExperience;

    @Size(max = 512) private String linkedinUrl;
    @Size(max = 512) private String githubUrl;
    @Size(max = 512) private String portfolioUrl;

    public String getResolvedInstitution() {
        if (institution != null && !institution.isBlank()) return institution;
        return university;
    }

    public String getResolvedDepartment() {
        if (department != null && !department.isBlank()) return department;
        return major;
    }
}
