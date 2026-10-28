package com.skilllens.resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private Long id;
    private String title;
    private String description;
    private String url;
    private String provider;
    private ResourceType resourceType;
    private CostType costType;
    private DifficultyLevel difficultyLevel;
    private Integer estimatedDurationHours;
    private Double rating;
    private Integer ratingCount;
    private Long skillId;
    private String skillName;
    private Boolean isVerified;
    private Instant createdAt;
}
