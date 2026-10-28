package com.skilllens.admin;

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
public class CreateAssessmentRequest {
    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @Builder.Default
    private Integer timeLimitMinutes = 30;

    @Builder.Default
    private Double passingScorePercentage = 70.0;

    private List<QuestionInput> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionInput {
        private String questionText;
        private Integer points;
        private List<OptionInput> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionInput {
        private String optionText;
        private Boolean isCorrect;
    }
}
