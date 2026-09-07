package com.skilllens.controller;

import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.OccupationDetailDto;
import com.skilllens.dto.OccupationDto;
import com.skilllens.service.OccupationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/occupations")
@RequiredArgsConstructor
public class OccupationController {

    private final OccupationService occupationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OccupationDto>>> getAllOccupations() {
        return ResponseEntity.ok(ApiResponse.success(occupationService.getAllOccupations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OccupationDetailDto>> getOccupationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(occupationService.getOccupationDetail(id)));
    }
}
