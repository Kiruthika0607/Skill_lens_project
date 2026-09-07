package com.skilllens.controller;

import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.JobMatchDto;
import com.skilllens.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobMatchDto>>> getJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean remote,
            @RequestParam(required = false) String jobType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobsForStudent(search, remote, jobType, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobMatchDto>> getJobDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobDetailForStudent(id)));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Boolean>> toggleSaveJob(@PathVariable Long id) {
        boolean saved = jobService.toggleSaveJob(id);
        String message = saved ? "Job saved successfully" : "Job removed from saved list";
        return ResponseEntity.ok(ApiResponse.success(message, saved));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<JobMatchDto>>> getSavedJobs() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getSavedJobsForStudent()));
    }
}
