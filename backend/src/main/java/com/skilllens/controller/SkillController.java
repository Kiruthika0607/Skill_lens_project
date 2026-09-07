package com.skilllens.controller;

import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.SkillCategoryDto;
import com.skilllens.dto.SkillDto;
import com.skilllens.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillDto>>> getAllSkills(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(skillService.searchSkills(search)));
        }
        return ResponseEntity.ok(ApiResponse.success(skillService.getAllSkills()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<SkillCategoryDto>>> getCategoriesWithSkills() {
        return ResponseEntity.ok(ApiResponse.success(skillService.getAllCategoriesWithSkills()));
    }
}
