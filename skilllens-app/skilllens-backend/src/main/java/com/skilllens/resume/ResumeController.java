package com.skilllens.resume;

import com.skilllens.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.skilllens.skill.StudentSkill;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Resumes", description = "Resume upload, automated parsing, text extraction, and skill identification")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = {"/api/resumes/upload", "/api/student/resume", "/api/student/resume/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Upload and parse student resume (PDF/DOCX/TXT)")
    public ResponseEntity<ResumeResponse> uploadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.uploadResume(principal, file));
    }

    @GetMapping({"/api/resumes/my", "/api/student/resume"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "List all resumes uploaded by the current student")
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(resumeService.getMyResumes(principal));
    }

    @GetMapping({"/api/resumes/{id}", "/api/student/resume/{id}"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get resume details with extracted text and detected skills")
    public ResponseEntity<ResumeResponse> getResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(resumeService.getResume(principal, id));
    }

    @GetMapping({"/api/resumes/{id}/analysis", "/api/student/resume/{id}/analysis"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get detailed analysis of extracted skills, education, and experience")
    public ResponseEntity<ResumeResponse> getResumeAnalysis(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(resumeService.getResume(principal, id));
    }

    @PostMapping({"/api/resumes/{id}/apply-skills", "/api/student/resume/{id}/apply-skills"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Apply selected extracted resume skills to student profile")
    public ResponseEntity<?> applySkills(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) ApplyResumeSkillsRequest request) {
        List<StudentSkill> applied = resumeService.applyExtractedSkills(principal, id, request);
        return ResponseEntity.ok(Map.of("message", "Skills applied successfully", "appliedCount", applied.size()));
    }

    @PatchMapping({"/api/resumes/{id}/confirm", "/api/student/resume/{id}/confirm"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Confirm and apply all detected skills to student profile")
    public ResponseEntity<?> confirmResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ResumeResponse resume = resumeService.getResume(principal, id);
        List<Long> skillIds = resume.getExtractedSkills() != null
                ? resume.getExtractedSkills().stream().map(ExtractedSkillDto::getSkillId).toList()
                : List.of();
        return ResponseEntity.ok(resumeService.applyExtractedSkills(
                principal, id, ApplyResumeSkillsRequest.builder().skillIds(skillIds).build()));
    }

    @DeleteMapping({"/api/resumes/{id}", "/api/student/resume/{id}"})
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Delete uploaded resume and stored file")
    public ResponseEntity<Void> deleteResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        resumeService.deleteResume(principal, id);
        return ResponseEntity.noContent().build();
    }
}
