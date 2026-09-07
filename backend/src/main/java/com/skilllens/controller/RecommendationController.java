package com.skilllens.controller;

import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.CertificationDto;
import com.skilllens.dto.CourseDto;
import com.skilllens.dto.ProjectDto;
import com.skilllens.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getCourses() {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.getRecommendedCourses()));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getProjects() {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.getRecommendedProjects()));
    }

    @GetMapping("/certifications")
    public ResponseEntity<ApiResponse<List<CertificationDto>>> getCertifications() {
        return ResponseEntity.ok(ApiResponse.success(recommendationService.getRecommendedCertifications()));
    }
}
