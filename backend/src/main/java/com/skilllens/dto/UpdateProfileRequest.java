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
public class UpdateProfileRequest {
    private String fullName;
    private String college;
    private String degree;
    private String department;
    private Integer graduationYear;
    private BigDecimal cgpa;
    private String careerInterest;
    private Long targetOccupationId;
    private String bio;
}
