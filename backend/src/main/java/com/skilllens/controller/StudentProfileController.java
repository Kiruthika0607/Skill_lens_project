package com.skilllens.controller;

import com.skilllens.dto.AddSkillRequest;
import com.skilllens.dto.ApiResponse;
import com.skilllens.dto.StudentProfileDto;
import com.skilllens.dto.UpdateProfileRequest;
import com.skilllens.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class StudentProfileController {

    private final StudentProfileService profileService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success(profileService.getCurrentProfileDto()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<StudentProfileDto>> updateProfile(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profileService.updateProfile(request)));
    }

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<StudentProfileDto>> addSkill(@Valid @RequestBody AddSkillRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Skill added and normalized successfully", profileService.addSkillToProfile(request)));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<ApiResponse<StudentProfileDto>> removeSkill(@PathVariable Long skillId) {
        return ResponseEntity.ok(ApiResponse.success("Skill removed successfully", profileService.removeSkillFromProfile(skillId)));
    }
}
