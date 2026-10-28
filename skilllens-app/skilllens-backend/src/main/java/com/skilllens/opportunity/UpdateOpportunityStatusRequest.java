package com.skilllens.opportunity;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOpportunityStatusRequest {
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
    private String notes;
}
