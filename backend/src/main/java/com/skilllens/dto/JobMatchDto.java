package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobMatchDto {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String description;
    private String salary;
    private String jobType;
    private boolean remote;
    private LocalDate postedDate;
    private String applyUrl;
    private double matchPercentage;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private boolean saved;
}
