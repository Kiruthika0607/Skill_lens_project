package com.skilllens.skillgap;

import com.skilllens.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Skill Gap", description = "Transparent skill gap calculation and analysis against career requirements")
public class SkillGapController {

    private final SkillGapService skillGapService;

    @GetMapping("/api/skill-gaps/careers/{careerId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Calculate skill gap for a target career role")
    public ResponseEntity<SkillGapReport> calculateGap(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long careerId) {
        return ResponseEntity.ok(skillGapService.calculateGap(principal, careerId));
    }

    @GetMapping("/api/careers/{careerId}/gap")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Calculate skill gap for a target career role (alias)")
    public ResponseEntity<SkillGapReport> getCareerGap(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long careerId) {
        return ResponseEntity.ok(skillGapService.calculateGap(principal, careerId));
    }
}
