package com.skilllens.assessment;
import lombok.*;
import java.util.List;
@Data @Builder
public class AssessmentDetailResponse {
    private Long id; private String title; private String description;
    private Long skillId; private String difficulty; private Integer timeLimitMinutes;
    private List<QuestionResponse> questions;
}
