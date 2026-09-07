package com.skilllens.dto;

import jakarta.validation.constraints.NotBlank;
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
public class JobFormRequest {
    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Company is required")
    private String company;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;
    private String salary;
    private String jobType;
    private boolean remote;
    private LocalDate postedDate;
    private String source;

    @NotBlank(message = "Apply URL is required")
    private String applyUrl;

    private List<Long> skillIds;
}
