package com.skilllens.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    private long totalUsers;
    private long totalStudents;
    private long totalAdmins;
    private long totalSkills;
    private long totalAssessments;
    private long totalAttemptsTaken;
    private double averageAssessmentScore;
    private long totalRoadmaps;
    private long totalOpportunities;
    private Map<String, Long> opportunitiesByType;
    private Map<String, Long> usersByStatus;
}
