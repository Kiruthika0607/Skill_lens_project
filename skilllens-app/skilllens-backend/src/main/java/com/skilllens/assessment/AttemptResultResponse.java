package com.skilllens.assessment;
import lombok.*;
import java.time.Instant;
@Data @Builder
public class AttemptResultResponse {
    private Long id; private Long assessmentId; private String assessmentTitle;
    private String status; private Integer score; private Integer maxScore;
    private Boolean passed; private Integer assessedProficiency; private Instant submittedAt;
}
