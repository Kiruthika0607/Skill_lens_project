package com.skilllens.opportunity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityMatchResponse {
    private OpportunityResponse opportunity;
    private Double matchPercentage;
    private Integer matchedSkillCount;
    private Integer totalRequiredSkillCount;
    private List<String> matchedSkillNames;
    private List<String> missingSkillNames;
}
