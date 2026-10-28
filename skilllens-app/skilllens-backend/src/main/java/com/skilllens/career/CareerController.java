package com.skilllens.career;
import com.skilllens.security.UserPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequiredArgsConstructor
@Tag(name="Careers", description="Career roles and recommendations")
public class CareerController {
    private final CareerService careerService;

    @GetMapping("/api/careers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CareerRoleResponse>> list() {
        return ResponseEntity.ok(careerService.listCareers());
    }

    @GetMapping("/api/careers/{careerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CareerRoleResponse> get(@PathVariable Long careerId) {
        return ResponseEntity.ok(careerService.getCareer(careerId));
    }

    @GetMapping({"/api/careers/{careerId}/required-skills", "/api/careers/{careerId}/industry-requirements"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CareerRequiredSkillResponse>> requiredSkills(@PathVariable Long careerId) {
        return ResponseEntity.ok(careerService.getRequiredSkills(careerId));
    }

    @GetMapping("/api/student/career-recommendations")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CareerRecommendationResponse>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal p) {
        return ResponseEntity.ok(careerService.getRecommendations(p));
    }

    @PostMapping("/api/student/career-recommendations/generate")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CareerRecommendationResponse>> generate(
            @AuthenticationPrincipal UserPrincipal p) {
        return ResponseEntity.ok(careerService.generateRecommendations(p));
    }

    @PostMapping("/api/student/career-goals")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CareerGoalResponse> setCareerGoal(
            @AuthenticationPrincipal UserPrincipal p,
            @RequestBody CareerGoalRequest request) {
        return ResponseEntity.ok(careerService.setCareerGoal(p, request.getCareerRoleId()));
    }

    @GetMapping("/api/student/career-goals")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CareerGoalResponse> getCareerGoal(
            @AuthenticationPrincipal UserPrincipal p) {
        return ResponseEntity.ok(careerService.getCareerGoal(p));
    }
}
