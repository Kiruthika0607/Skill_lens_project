package com.skilllens.skill;

import com.skilllens.common.dto.PagedResponse;
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
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Skill catalog and student skill management")
public class SkillController {

    private final SkillService skillService;

    @GetMapping("/api/skills")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search the skill catalog")
    public ResponseEntity<PagedResponse<SkillResponse>> searchSkills(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(skillService.searchSkills(search, page, size));
    }

    @GetMapping("/api/skills/categories")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all skill categories")
    public ResponseEntity<List<SkillCategory>> getSkillCategories() {
        return ResponseEntity.ok(skillService.getAllCategories());
    }

    @PostMapping({"/api/admin/skills", "/api/skills"})
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Create a new skill in the catalog")
    public ResponseEntity<SkillResponse> createSkill(
            @Valid @RequestBody CreateSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(skillService.createSkill(request));
    }

    @GetMapping({"/api/student/skills", "/api/skills/my"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get the authenticated student's skills")
    public ResponseEntity<List<StudentSkillResponse>> getStudentSkills(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(skillService.getStudentSkills(principal));
    }

    @PostMapping({"/api/student/skills", "/api/skills/my"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Add a skill to the student's profile")
    public ResponseEntity<StudentSkillResponse> addStudentSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddStudentSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(skillService.addStudentSkill(principal, request));
    }

    @PutMapping("/api/student/skills/{studentSkillId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update self-reported proficiency for a student skill")
    public ResponseEntity<StudentSkillResponse> updateStudentSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long studentSkillId,
            @Valid @RequestBody UpdateStudentSkillRequest request) {
        return ResponseEntity.ok(skillService.updateStudentSkill(principal, studentSkillId, request));
    }

    @DeleteMapping("/api/student/skills/{studentSkillId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Remove a skill from the student's profile")
    public ResponseEntity<Void> removeStudentSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long studentSkillId) {
        skillService.removeStudentSkill(principal, studentSkillId);
        return ResponseEntity.noContent().build();
    }
}
