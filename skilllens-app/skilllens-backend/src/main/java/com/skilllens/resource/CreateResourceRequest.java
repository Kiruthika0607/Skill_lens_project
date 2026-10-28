package com.skilllens.resource;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateResourceRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "URL is required")
    private String url;

    private String provider;

    @NotNull(message = "Resource type is required")
    private ResourceType resourceType;

    private CostType costType;

    private DifficultyLevel difficultyLevel;

    private Integer estimatedDurationHours;

    @NotNull(message = "Skill ID is required")
    private Long skillId;
}
