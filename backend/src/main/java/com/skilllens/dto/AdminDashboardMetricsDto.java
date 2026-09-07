package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardMetricsDto {
    private long totalStudents;
    private long totalJobs;
    private long totalSkills;
    private long totalOccupations;
    private long totalCourses;
    private long totalProjects;
    private long totalCertifications;
    private List<TrendDto> topDemandedSkills;
    private List<Map<String, Object>> locationDistribution;
    private List<Map<String, Object>> jobTypeDistribution;
    private long remoteJobsCount;
    private long onsiteJobsCount;
}
