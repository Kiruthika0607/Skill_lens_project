package com.skilllens.dto;

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
public class StudentProfileDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String college;
    private String degree;
    private String department;
    private Integer graduationYear;
    private BigDecimal cgpa;
    private String careerInterest;
    private Long targetOccupationId;
    private String targetOccupationTitle;
    private String bio;
    private List<StudentSkillDto> skills;
}
