package com.skilllens.assessment;
import lombok.*;
import java.util.List;
@Data @Builder
public class QuestionResponse {
    private Long id; private String questionText; private String questionType;
    private int points; private List<OptionResponse> options;
}
