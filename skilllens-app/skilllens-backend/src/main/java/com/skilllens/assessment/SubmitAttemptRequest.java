package com.skilllens.assessment;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;
@Data
public class SubmitAttemptRequest {
    private List<AnswerDto> answers;
    @Data
    public static class AnswerDto {
        @NotNull private Long questionId;
        @NotNull private List<Long> selectedOptionIds;
    }
}
