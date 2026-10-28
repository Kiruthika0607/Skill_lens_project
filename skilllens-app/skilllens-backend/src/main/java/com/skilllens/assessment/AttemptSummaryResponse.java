package com.skilllens.assessment;
import lombok.*;
import java.time.Instant;
@Data @Builder
public class AttemptSummaryResponse {
    private Long id; private Long assessmentId; private String status;
    private Integer score; private Integer maxScore; private Boolean passed;
    private Integer assessedProficiency; private Instant startedAt; private Instant submittedAt;
}
