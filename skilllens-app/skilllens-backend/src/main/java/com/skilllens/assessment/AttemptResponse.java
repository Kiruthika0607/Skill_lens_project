package com.skilllens.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResponse {
    private Long id;
    private Long assessmentId;
    private String status;
    private Instant startedAt;
    private List<QuestionResponse> questions;
}
