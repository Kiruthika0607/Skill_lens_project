package com.skilllens.career;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerGoalRequest {
    @NotNull(message = "Career role ID is required")
    private Long careerRoleId;
}
