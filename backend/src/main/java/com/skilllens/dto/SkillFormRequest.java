package com.skilllens.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillFormRequest {
    @NotBlank(message = "Skill name is required")
    private String name;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String description;
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private String demandLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private List<String> aliases; // optional aliases, e.g. ["JS", "Javascript"]
}
