package com.skilllens.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {
    private Long id;
    private Long userId;
    private String originalFilename;
    private Long fileSizeBytes;
    private String mimeType;
    private ResumeStatus status;
    private String rawTextSnippet;
    private List<ExtractedSkillDto> extractedSkills;
    private List<String> extractedEducation;
    private List<String> extractedExperience;
    private String errorMessage;
    private Instant createdAt;
    private Instant updatedAt;
}
