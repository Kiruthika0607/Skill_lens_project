package com.skilllens.opportunity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunitySkillDto {
    private Long skillId;
    private String skillName;
    private Boolean isRequired;
    private Integer minProficiency;
}
