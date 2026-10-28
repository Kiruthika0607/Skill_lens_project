package com.skilllens.skill;

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
public class CreateSkillRequest {
    @NotBlank
    private String name;

    @NotNull
    private Long categoryId;

    private String description;

    private String tags;
}
