package com.skilllens.roadmap;

import com.skilllens.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Career Roadmaps", description = "Personalized career progression pathways, milestones, and step-by-step guidance")
public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping({"/api/roadmaps/generate", "/api/student/roadmaps/generate"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Generate a personalized career roadmap based on skill gaps and target career role")
    public ResponseEntity<RoadmapResponse> generateRoadmap(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GenerateRoadmapRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roadmapService.generateRoadmap(principal, request));
    }

    @GetMapping({"/api/roadmaps/my", "/api/student/roadmaps"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get all active and past roadmaps for the current student")
    public ResponseEntity<List<RoadmapResponse>> getMyRoadmaps(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(roadmapService.getMyRoadmaps(principal));
    }

    @GetMapping({"/api/roadmaps/{id}", "/api/student/roadmaps/{id}"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get details of a specific roadmap and its ordered milestones")
    public ResponseEntity<RoadmapResponse> getRoadmap(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(roadmapService.getRoadmap(principal, id));
    }

    @GetMapping({"/api/roadmaps/{id}/progress", "/api/student/roadmaps/{id}/progress"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get progress percentage and milestone stats for a roadmap")
    public ResponseEntity<Map<String, Object>> getRoadmapProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        RoadmapResponse r = roadmapService.getRoadmap(principal, id);
        return ResponseEntity.ok(Map.of(
                "roadmapId", r.getId(),
                "completionPercentage", r.getCompletionPercentage(),
                "totalMilestones", r.getTotalMilestones(),
                "completedMilestones", r.getCompletedMilestones(),
                "status", r.getStatus()
        ));
    }

    @PatchMapping({
            "/api/roadmaps/{id}/milestones/{milestoneId}/status",
            "/api/roadmaps/{id}/milestones/{milestoneId}",
            "/api/student/roadmaps/{id}/milestones/{milestoneId}"
    })
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update progress status of a roadmap milestone")
    public ResponseEntity<RoadmapResponse> updateMilestoneStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @PathVariable Long milestoneId,
            @Valid @RequestBody UpdateMilestoneStatusRequest request) {
        return ResponseEntity.ok(roadmapService.updateMilestoneStatus(principal, id, milestoneId, request));
    }

    @DeleteMapping({"/api/roadmaps/{id}", "/api/student/roadmaps/{id}"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete an existing roadmap")
    public ResponseEntity<Void> deleteRoadmap(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        roadmapService.deleteRoadmap(principal, id);
        return ResponseEntity.noContent().build();
    }
}
