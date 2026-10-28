package com.skilllens.resource;

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

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Learning Resources", description = "Curated courses, articles, videos, and books mapped to skills")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping({"/api/resources", "/api/student/resources"})
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search and filter learning resources with pagination")
    public ResponseEntity<PagedResponse<ResourceResponse>> searchResources(
            @RequestParam(required = false) Long skillId,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) CostType cost,
            @RequestParam(required = false) DifficultyLevel difficulty,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(resourceService.searchResources(skillId, type, cost, difficulty, search, pageable));
    }

    @GetMapping("/api/student/resources/recommended")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get recommended learning resources based on student skill gaps")
    public ResponseEntity<List<ResourceResponse>> getRecommendedResources(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.skilllens.security.UserPrincipal principal) {
        return ResponseEntity.ok(resourceService.getRecommendedResources(principal));
    }

    @GetMapping("/api/student/resources/saved")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get saved learning resources for the authenticated student")
    public ResponseEntity<List<SavedResource>> getSavedResources(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.skilllens.security.UserPrincipal principal) {
        return ResponseEntity.ok(resourceService.getStudentSavedResources(principal));
    }

    @PostMapping("/api/student/resources/{resourceId}/save")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save / bookmark a learning resource")
    public ResponseEntity<SavedResource> saveResource(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.skilllens.security.UserPrincipal principal,
            @PathVariable Long resourceId) {
        return ResponseEntity.ok(resourceService.saveResource(principal, resourceId));
    }

    @DeleteMapping("/api/student/resources/{resourceId}/save")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Unsave a learning resource")
    public ResponseEntity<Void> unsaveResource(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.skilllens.security.UserPrincipal principal,
            @PathVariable Long resourceId) {
        resourceService.unsaveResource(principal, resourceId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/student/resources/{resourceId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update learning resource progress percent")
    public ResponseEntity<SavedResource> updateProgress(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.skilllens.security.UserPrincipal principal,
            @PathVariable Long resourceId,
            @Valid @RequestBody UpdateResourceProgressRequest request) {
        return ResponseEntity.ok(resourceService.updateProgress(principal, resourceId, request.getProgressPercent()));
    }


    @GetMapping("/api/resources/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get specific learning resource details")
    public ResponseEntity<ResourceResponse> getResource(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResource(id));
    }

    @GetMapping("/api/resources/by-skill/{skillId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all learning resources for a specific skill")
    public ResponseEntity<List<ResourceResponse>> getResourcesBySkill(@PathVariable Long skillId) {
        return ResponseEntity.ok(resourceService.getResourcesBySkill(skillId));
    }

    @PostMapping("/api/admin/resources")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Create a new learning resource")
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody CreateResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
    }

    @PutMapping("/api/admin/resources/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Update a learning resource")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody CreateResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/api/admin/resources/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Delete a learning resource")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
