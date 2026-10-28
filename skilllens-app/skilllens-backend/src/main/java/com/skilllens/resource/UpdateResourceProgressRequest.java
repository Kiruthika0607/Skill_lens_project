package com.skilllens.resource;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateResourceProgressRequest {
    @NotNull(message = "Progress percent is required")
    @Min(0)
    @Max(100)
    private Integer progressPercent;
}
