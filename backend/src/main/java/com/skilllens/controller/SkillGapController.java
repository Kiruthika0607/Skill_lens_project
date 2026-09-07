package com.skilllens.controller;

import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.SkillGapAnalysisResponse;
import com.skilllens.service.SkillGapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/skill-gap")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class SkillGapController {

    private final SkillGapService skillGapService;

    @GetMapping
    public ResponseEntity<ApiResponse<SkillGapAnalysisResponse>> getSkillGapAnalysis() {
        return ResponseEntity.ok(ApiResponse.success(skillGapService.getSkillGapAnalysisForCurrentStudent()));
    }
}
