package com.skilllens.controller;

import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.RoadmapDto;
import com.skilllens.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class RoadmapController {

    private final RoadmapService roadmapService;

    @GetMapping
    public ResponseEntity<ApiResponse<RoadmapDto>> getRoadmap(@RequestParam(required = false) Long occupationId) {
        return ResponseEntity.ok(ApiResponse.success(roadmapService.getOrCreateRoadmapForCurrentStudent(occupationId)));
    }

    @PutMapping("/items/{itemId}/status")
    public ResponseEntity<ApiResponse<RoadmapDto>> updateMilestoneStatus(
            @PathVariable Long itemId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(ApiResponse.success("Milestone updated", roadmapService.updateItemStatus(itemId, status)));
    }
}
