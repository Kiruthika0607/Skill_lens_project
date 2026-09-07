package com.skilllens.controller;

import com.skilllens.dto.*;
import com.skilllens.entity.AdminLog;
import com.skilllens.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final SkillService skillService;
    private final OccupationService occupationService;
    private final JobService jobService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardMetricsDto>> getDashboardMetrics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardMetrics()));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllStudents()));
    }

    @PutMapping("/students/{id}/status")
    public ResponseEntity<ApiResponse<Boolean>> toggleStudentStatus(@PathVariable Long id) {
        boolean active = adminService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Student status updated", active));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<SkillDto>> createSkill(@Valid @RequestBody SkillFormRequest request) {
        SkillDto created = skillService.createSkill(request);
        adminService.logAction("CREATE_SKILL", "Skill", created.getId(), "Created canonical skill: " + created.getName());
        return ResponseEntity.ok(ApiResponse.success("Skill created successfully", created));
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<SkillDto>> updateSkill(@PathVariable Long id, @Valid @RequestBody SkillFormRequest request) {
        SkillDto updated = skillService.updateSkill(id, request);
        adminService.logAction("UPDATE_SKILL", "Skill", id, "Updated canonical skill: " + updated.getName());
        return ResponseEntity.ok(ApiResponse.success("Skill updated successfully", updated));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
        adminService.logAction("DELETE_SKILL", "Skill", id, "Deleted skill ID: " + id);
        return ResponseEntity.ok(ApiResponse.success("Skill deleted successfully", null));
    }

    @PostMapping("/occupations")
    public ResponseEntity<ApiResponse<OccupationDetailDto>> createOccupation(@Valid @RequestBody OccupationFormRequest request) {
        OccupationDetailDto created = occupationService.createOccupation(request);
        adminService.logAction("CREATE_OCCUPATION", "Occupation", created.getId(), "Created occupation: " + created.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Occupation created successfully", created));
    }

    @DeleteMapping("/occupations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOccupation(@PathVariable Long id) {
        occupationService.deleteOccupation(id);
        adminService.logAction("DELETE_OCCUPATION", "Occupation", id, "Deleted occupation ID: " + id);
        return ResponseEntity.ok(ApiResponse.success("Occupation deleted successfully", null));
    }

    @PostMapping("/jobs")
    public ResponseEntity<ApiResponse<JobPostingDto>> createJob(@Valid @RequestBody JobFormRequest request) {
        JobPostingDto created = jobService.createJob(request);
        adminService.logAction("CREATE_JOB", "JobPosting", created.getId(), "Created job: " + created.getTitle() + " at " + created.getCompany());
        return ResponseEntity.ok(ApiResponse.success("Job posting created successfully", created));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        adminService.logAction("DELETE_JOB", "JobPosting", id, "Deleted job ID: " + id);
        return ResponseEntity.ok(ApiResponse.success("Job posting deleted successfully", null));
    }

    @GetMapping("/datasets")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDatasets() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDatasetStatuses()));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<AdminLog>>> getRecentLogs() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRecentLogs()));
    }
}
