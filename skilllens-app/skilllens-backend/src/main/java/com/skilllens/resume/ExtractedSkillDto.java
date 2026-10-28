package com.skilllens.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedSkillDto {
    private Long skillId;
    private String skillName;
    private String category;
    private Integer matchedOccurrences;
    private Integer suggestedProficiency; // 1 to 5 based on context and occurrences
    private Double confidence;            // 0.0 to 1.0
}
