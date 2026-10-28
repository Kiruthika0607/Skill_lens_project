package com.skilllens.industry;

import com.skilllens.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/industry")
@RequiredArgsConstructor
@Tag(name = "Industry Skill Trends", description = "Real-world engineering market demand, salary benchmarks, and hiring projections")
public class IndustryTrendController {

    private final IndustryTrendService trendService;

    @GetMapping({"/trends", "/skills"})
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Search industry skill trends across sectors")
    public ResponseEntity<PagedResponse<IndustryTrendResponse>> searchTrends(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) Long skillId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(trendService.searchTrends(sector, skillId, pageable));
    }

    @GetMapping("/skills/{skillId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get historical and current market trends for a skill")
    public ResponseEntity<List<IndustryTrendResponse>> getTrendsForSkill(@PathVariable Long skillId) {
        return ResponseEntity.ok(trendService.getTrendsForSkill(skillId));
    }

    @GetMapping({"/top-in-demand", "/skills/demand"})
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get top in-demand skills ranked by market demand score")
    public ResponseEntity<List<IndustryTrendResponse>> getTopInDemand(
            @RequestParam(required = false) String sector,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trendService.getTopInDemand(sector, limit));
    }

    @GetMapping("/trends/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get detailed trend record by ID")
    public ResponseEntity<IndustryTrendResponse> getTrendById(@PathVariable Long id) {
        return ResponseEntity.ok(trendService.getTrendById(id));
    }
}
