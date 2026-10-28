package com.skilllens.roadmap;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateRoadmapRequest {
    @NotNull(message = "Career role ID is required")
    private Long careerRoleId;

    private String customTitle;
}
