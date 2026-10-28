package com.skilllens.admin;

import com.skilllens.assessment.Assessment;
import com.skilllens.audit.AuditLogResponse;
import com.skilllens.career.CareerRole;
import com.skilllens.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Privileged administrator operations: user management, catalog management, quizzes, and audit logs")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "Admin: List and search registered users with pagination")
    public ResponseEntity<PagedResponse<UserSummaryResponse>> listUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.listUsers(pageable));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Admin: Activate, deactivate, or change user role")
    public ResponseEntity<UserSummaryResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, request));
    }

    @PostMapping({"/career-roles", "/careers"})
    @Operation(summary = "Admin: Create a new career role with required skills and weights")
    public ResponseEntity<CareerRole> createCareerRole(
            @Valid @RequestBody CreateCareerRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createCareerRole(request));
    }

    @DeleteMapping({"/career-roles/{id}", "/careers/{id}"})
    @Operation(summary = "Admin: Deactivate a career role")
    public ResponseEntity<Void> deleteCareerRole(@PathVariable Long id) {
        adminService.deleteCareerRole(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assessments")
    @Operation(summary = "Admin: Create a skill assessment quiz with questions and answer keys")
    public ResponseEntity<Assessment> createAssessment(
            @Valid @RequestBody CreateAssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAssessment(request));
    }

    @DeleteMapping("/assessments/{id}")
    @Operation(summary = "Admin: Deactivate an assessment")
    public ResponseEntity<Void> deleteAssessment(@PathVariable Long id) {
        adminService.deleteAssessment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Admin: Query security and administrative audit logs")
    public ResponseEntity<PagedResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Instant fromTime,
            @RequestParam(required = false) Instant toTime,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAuditLogs(userId, action, fromTime, toTime, pageable));
    }
}
