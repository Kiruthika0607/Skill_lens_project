package com.skilllens.controller;

import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.TrendDto;
import com.skilllens.service.TrendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trends")
@RequiredArgsConstructor
public class TrendController {

    private final TrendService trendService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrendDto>>> getTrends(@RequestParam(defaultValue = "15") int limit) {
        return ResponseEntity.ok(ApiResponse.success(trendService.getTopDemandedSkills(limit)));
    }

    @GetMapping("/direction/{direction}")
    public ResponseEntity<ApiResponse<List<TrendDto>>> getTrendsByDirection(@PathVariable String direction) {
        return ResponseEntity.ok(ApiResponse.success(trendService.getTrendsByDirection(direction)));
    }
}
