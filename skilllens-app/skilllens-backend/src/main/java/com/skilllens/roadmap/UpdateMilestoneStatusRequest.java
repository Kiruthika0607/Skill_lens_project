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
public class UpdateMilestoneStatusRequest {
    @NotNull(message = "Milestone status is required")
    private MilestoneStatus status;
}
