package com.skilllens.career;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerGoalResponse {
    private Long careerRoleId;
    private String careerRoleTitle;
    private String industry;
    private String description;
}
