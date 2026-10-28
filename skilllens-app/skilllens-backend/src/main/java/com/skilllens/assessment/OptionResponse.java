package com.skilllens.assessment;
import lombok.*;
@Data @Builder
public class OptionResponse {
    private Long id; private String optionText;
    // isCorrect is intentionally omitted
}
