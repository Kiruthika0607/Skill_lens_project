package com.skilllens.controller;

import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.CareerMatchResponse;
import com.skilllens.service.CareerMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/careers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class CareerController {

    private final CareerMatchingService matchingService;

    @GetMapping("/recommended")
    public ResponseEntity<ApiResponse<List<CareerMatchResponse>>> getTopRecommendedCareers() {
        return ResponseEntity.ok(ApiResponse.success(matchingService.getTopRecommendedCareers()));
    }

    @GetMapping("/{id}/match")
    public ResponseEntity<ApiResponse<CareerMatchResponse>> getCareerMatch(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(matchingService.getMatchForCurrentStudent(id)));
    }
}
