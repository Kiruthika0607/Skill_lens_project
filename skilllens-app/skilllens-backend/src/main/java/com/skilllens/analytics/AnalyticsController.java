package com.skilllens.analytics;

import com.skilllens.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Student skill progression insights and platform-wide metrics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/api/analytics/student")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get aggregated skill progression, assessment history, and application stats for student")
    public ResponseEntity<StudentAnalyticsResponse> getStudentAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(principal));
    }

    @GetMapping("/api/admin/analytics/platform")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Get platform-wide user, assessment, roadmap, and opportunity metrics")
    public ResponseEntity<AdminAnalyticsResponse> getPlatformAnalytics() {
        return ResponseEntity.ok(analyticsService.getPlatformAnalytics());
    }
}
