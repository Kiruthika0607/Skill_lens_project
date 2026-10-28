package com.skilllens.assessment;

import com.skilllens.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
@Tag(name = "Assessments", description = "Assessment catalog and attempt management")
public class AssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List all available assessments, prioritized by user resume skills")
    public ResponseEntity<List<AssessmentSummaryResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assessmentService.listAssessments(principal));
    }

    @GetMapping("/{assessmentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get assessment details with questions (correct answers not returned)")
    public ResponseEntity<AssessmentDetailResponse> get(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.getAssessment(assessmentId));
    }

    @PostMapping({"/{assessmentId}/attempts", "/{assessmentId}/start"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start a new attempt for an assessment")
    public ResponseEntity<AttemptResponse> startAttempt(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long assessmentId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assessmentService.startAttempt(principal, assessmentId));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit answers for an in-progress attempt")
    public ResponseEntity<AttemptResultResponse> submit(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long attemptId,
            @Valid @RequestBody SubmitAttemptRequest request) {
        return ResponseEntity.ok(assessmentService.submitAttempt(principal, attemptId, request));
    }

    @GetMapping("/attempts/{attemptId}/result")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Retrieve the result of a completed attempt")
    public ResponseEntity<AttemptResultResponse> result(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long attemptId) {
        return ResponseEntity.ok(assessmentService.getAttemptResult(principal, attemptId));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get the student's assessment history")
    public ResponseEntity<List<AttemptSummaryResponse>> history(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assessmentService.getStudentHistory(principal));
    }

    @PostMapping("/resume-generate")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Generate questions tailored to skills, qualifications, and experience from the user's uploaded resume")
    public ResponseEntity<AssessmentDetailResponse> generateFromResume(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assessmentService.generateResumeAssessment(principal));
    }

    @GetMapping("/resume-profile")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get summary of candidate resume skills, qualifications, and experience for assessment")
    public ResponseEntity<java.util.Map<String, Object>> getResumeProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assessmentService.getResumeAssessmentProfile(principal));
    }
}
