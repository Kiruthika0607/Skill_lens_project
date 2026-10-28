package com.skilllens.opportunity;

import com.skilllens.common.dto.PagedResponse;
import com.skilllens.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Opportunities", description = "Aggregation of Jobs, Internships, Scholarships, and Hackathons with skill match scoring")
public class OpportunityController {

    private final OpportunityService opportunityService;

    @GetMapping("/api/opportunities")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search and filter opportunities (Jobs, Internships, Scholarships, Hackathons)")
    public ResponseEntity<PagedResponse<OpportunityResponse>> searchOpportunities(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) OpportunityType type,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Instant deadlineAfter,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(opportunityService.searchOpportunities(
                principal, type, isRemote, location, deadlineAfter, search, pageable));
    }

    @GetMapping("/api/opportunities/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get detailed information about an opportunity")
    public ResponseEntity<OpportunityResponse> getOpportunity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(opportunityService.getOpportunityById(principal, id));
    }

    @GetMapping({"/api/opportunities/matches", "/api/student/opportunities/recommended"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get opportunities matched and ranked by student assessed skills")
    public ResponseEntity<List<OpportunityMatchResponse>> getMatchedOpportunities(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(opportunityService.getMatchedOpportunities(principal, limit));
    }

    @PostMapping({"/api/opportunities/{id}/save", "/api/student/opportunities/{id}/save"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save / bookmark an opportunity")
    public ResponseEntity<SavedOpportunity> saveOpportunity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) SaveOpportunityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(opportunityService.saveOpportunity(principal, id, request));
    }

    @DeleteMapping({"/api/opportunities/{id}/save", "/api/student/opportunities/{id}/save"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Remove saved opportunity")
    public ResponseEntity<Void> unsaveOpportunity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        opportunityService.unsaveOpportunity(principal, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/api/opportunities/saved", "/api/student/opportunities/saved"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "List all opportunities saved or applied to by current student")
    public ResponseEntity<List<OpportunityResponse>> getSavedOpportunities(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(opportunityService.getMySavedOpportunities(principal));
    }

    @PatchMapping({"/api/opportunities/{id}/status", "/api/student/opportunities/{id}/status"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Update opportunity application status (SAVED, APPLIED, INTERVIEWING, OFFERED, REJECTED)")
    public ResponseEntity<SavedOpportunity> updateApplicationStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOpportunityStatusRequest request) {
        return ResponseEntity.ok(opportunityService.updateApplicationStatus(principal, id, request));
    }

    @PostMapping("/api/admin/opportunities")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Post a new opportunity")
    public ResponseEntity<OpportunityResponse> createOpportunity(
            @Valid @RequestBody CreateOpportunityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(opportunityService.createOpportunity(request));
    }

    @DeleteMapping("/api/admin/opportunities/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Deactivate an opportunity")
    public ResponseEntity<Void> deleteOpportunity(@PathVariable Long id) {
        opportunityService.deleteOpportunity(id);
        return ResponseEntity.noContent().build();
    }
}
