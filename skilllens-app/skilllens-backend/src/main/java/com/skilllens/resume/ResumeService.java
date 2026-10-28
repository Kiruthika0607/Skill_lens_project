package com.skilllens.resume;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skilllens.common.exception.BadRequestException;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final StorageService storageService;
    private final ResumeParserService resumeParserService;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final ObjectMapper objectMapper;
    private final com.skilllens.student.StudentProfileRepository studentProfileRepository;
    private final com.skilllens.career.CareerService careerService;
    private final com.skilllens.assessment.AssessmentService assessmentService;

    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain"
    );

    @Transactional
    public ResumeResponse uploadResume(UserPrincipal principal, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        String mimeType = file.getContentType();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        String lowerFilename = originalFilename.toLowerCase();

        boolean validExt = lowerFilename.endsWith(".pdf") || lowerFilename.endsWith(".docx")
                || lowerFilename.endsWith(".doc") || lowerFilename.endsWith(".txt");

        if (!validExt && (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType))) {
            throw new BadRequestException("Only PDF, DOCX, DOC, and TXT files are allowed");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }

        String storedPath = storageService.store(file, "resumes");
        String storedFilename = storedPath.substring(storedPath.lastIndexOf('/') + 1);

        Resume resume = Resume.builder()
                .userId(principal.getId())
                .originalFilename(originalFilename)
                .storedFilename(storedFilename)
                .filePath(storedPath)
                .fileSizeBytes(file.getSize())
                .mimeType(mimeType != null ? mimeType : "application/octet-stream")
                .status(ResumeStatus.PARSING)
                .build();

        resume = resumeRepository.save(resume);

        // Synchronously parse to provide immediate feedback to the student
        try (InputStream is = file.getInputStream()) {
            String extractedText = resumeParserService.extractText(is);
            resume.setExtractedText(extractedText);

            ParsedResumeDto parsed = resumeParserService.parseResumeText(extractedText);
            resume.setParsedSkillsJson(objectMapper.writeValueAsString(parsed.getSkills()));
            resume.setParsedEducationJson(objectMapper.writeValueAsString(parsed.getEducation()));
            resume.setParsedExperienceJson(objectMapper.writeValueAsString(parsed.getExperience()));
            resume.setStatus(ResumeStatus.PARSED);
            log.info("Successfully parsed resume {} for user {}, matched {} skills",
                    resume.getId(), principal.getId(), parsed.getSkills().size());

            // 1. Automatically apply extracted skills to student inventory in MySQL
            for (ExtractedSkillDto skillDto : parsed.getSkills()) {
                Optional<Skill> skillOpt = skillRepository.findById(skillDto.getSkillId());
                if (skillOpt.isPresent()) {
                    Optional<StudentSkill> existing = studentSkillRepository.findByUserIdAndSkillId(principal.getId(), skillDto.getSkillId());
                    StudentSkill studentSkill;
                    if (existing.isPresent()) {
                        studentSkill = existing.get();
                        int suggested = skillDto.getSuggestedProficiency();
                        if (studentSkill.getSelfReportedProficiency() == null || suggested > studentSkill.getSelfReportedProficiency()) {
                            studentSkill.setSelfReportedProficiency(suggested);
                        }
                    } else {
                        studentSkill = StudentSkill.builder()
                                .userId(principal.getId())
                                .skill(skillOpt.get())
                                .selfReportedProficiency(skillDto.getSuggestedProficiency())
                                .build();
                    }
                    studentSkillRepository.save(studentSkill);
                }
            }

            // 2. Automatically sync profile contact/education if missing
            studentProfileRepository.findByUserId(principal.getId()).ifPresent(profile -> {
                boolean changed = false;
                if ((profile.getPhone() == null || profile.getPhone().isBlank()) && parsed.getPhone() != null) {
                    profile.setPhone(parsed.getPhone());
                    changed = true;
                }
                if ((profile.getInstitution() == null || profile.getInstitution().isBlank()) && parsed.getEducation() != null && !parsed.getEducation().isEmpty()) {
                    profile.setInstitution(parsed.getEducation().get(0));
                    changed = true;
                }
                if (changed) {
                    studentProfileRepository.save(profile);
                }
            });

            // 3. Automatically generate career recommendations based on the newly parsed resume
            try {
                careerService.generateRecommendations(principal);
            } catch (Exception recEx) {
                log.warn("Auto career recommendation generation skipped: {}", recEx.getMessage());
            }

            // 4. Automatically generate resume-tailored assessment questions based on parsed skills & experience
            try {
                assessmentService.generateResumeAssessment(principal);
            } catch (Exception assessEx) {
                log.warn("Auto resume assessment generation skipped: {}", assessEx.getMessage());
            }

        } catch (Exception e) {
            log.error("Error parsing resume {}: {}", resume.getId(), e.getMessage(), e);
            resume.setStatus(ResumeStatus.FAILED);
            resume.setErrorMessage(e.getMessage());
        }

        resume = resumeRepository.save(resume);
        return mapToResponse(resume);
    }

    @Transactional(readOnly = true)
    public ResumeResponse getResume(UserPrincipal principal, Long resumeId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));
        return mapToResponse(resume);
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getMyResumes(UserPrincipal principal) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ResumeResponse> getMyResumesPaged(UserPrincipal principal, Pageable pageable) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(principal.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public List<StudentSkill> applyExtractedSkills(UserPrincipal principal, Long resumeId, ApplyResumeSkillsRequest request) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        if (resume.getStatus() != ResumeStatus.PARSED) {
            throw new BadRequestException("Resume parsing has not completed or failed");
        }

        List<ExtractedSkillDto> extractedSkills = parseSkillsJson(resume.getParsedSkillsJson());
        List<StudentSkill> appliedList = new ArrayList<>();

        List<Long> targetIds = (request != null && request.getSkillIds() != null && !request.getSkillIds().isEmpty())
                ? request.getSkillIds()
                : extractedSkills.stream().map(ExtractedSkillDto::getSkillId).toList();

        for (Long skillId : targetIds) {
            Optional<ExtractedSkillDto> matchedDto = extractedSkills.stream()
                    .filter(s -> s.getSkillId().equals(skillId))
                    .findFirst();

            if (matchedDto.isEmpty()) {
                continue;
            }

            Skill skill = skillRepository.findById(skillId)
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));

            Optional<StudentSkill> existing = studentSkillRepository.findByUserIdAndSkillId(principal.getId(), skillId);
            StudentSkill studentSkill;
            if (existing.isPresent()) {
                studentSkill = existing.get();
                // Update self reported proficiency if not already higher
                int suggested = matchedDto.get().getSuggestedProficiency();
                if (studentSkill.getSelfReportedProficiency() == null || suggested > studentSkill.getSelfReportedProficiency()) {
                    studentSkill.setSelfReportedProficiency(suggested);
                }
            } else {
                studentSkill = StudentSkill.builder()
                        .userId(principal.getId())
                        .skill(skill)
                        .selfReportedProficiency(matchedDto.get().getSuggestedProficiency())
                        .build();
            }
            appliedList.add(studentSkillRepository.save(studentSkill));
        }

        log.info("Applied {} skills from resume {} for user {}", appliedList.size(), resumeId, principal.getId());
        return appliedList;
    }

    @Transactional
    public void deleteResume(UserPrincipal principal, Long resumeId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));
        storageService.delete(resume.getFilePath());
        resumeRepository.delete(resume);
    }

    private ResumeResponse mapToResponse(Resume resume) {
        List<ExtractedSkillDto> skills = parseSkillsJson(resume.getParsedSkillsJson());
        List<String> education = parseStringListJson(resume.getParsedEducationJson());
        List<String> experience = parseStringListJson(resume.getParsedExperienceJson());

        String snippet = null;
        if (resume.getExtractedText() != null) {
            snippet = resume.getExtractedText().length() > 500
                    ? resume.getExtractedText().substring(0, 500) + "..."
                    : resume.getExtractedText();
        }

        return ResumeResponse.builder()
                .id(resume.getId())
                .userId(resume.getUserId())
                .originalFilename(resume.getOriginalFilename())
                .fileSizeBytes(resume.getFileSizeBytes())
                .mimeType(resume.getMimeType())
                .status(resume.getStatus())
                .rawTextSnippet(snippet)
                .extractedSkills(skills)
                .extractedEducation(education)
                .extractedExperience(experience)
                .errorMessage(resume.getErrorMessage())
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }    @Transactional
    public void reparseResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId).orElse(null);
        if (resume == null || resume.getFilePath() == null) return;
        try (InputStream is = storageService.loadAsStream(resume.getFilePath())) {
            String extractedText = resumeParserService.extractText(is);
            resume.setExtractedText(extractedText);
            ParsedResumeDto parsed = resumeParserService.parseResumeText(extractedText);
            resume.setParsedSkillsJson(objectMapper.writeValueAsString(parsed.getSkills()));
            resume.setParsedEducationJson(objectMapper.writeValueAsString(parsed.getEducation()));
            resume.setParsedExperienceJson(objectMapper.writeValueAsString(parsed.getExperience()));
            resume.setStatus(ResumeStatus.PARSED);
            resume.setErrorMessage(null);
            resumeRepository.save(resume);
            log.info("Retry parsing succeeded for resume {}", resumeId);
        } catch (Exception e) {
            log.warn("Retry parsing failed for resume {}: {}", resumeId, e.getMessage());
            resume.setStatus(ResumeStatus.FAILED);
            resume.setErrorMessage(e.getMessage());
            resumeRepository.save(resume);
        }
    }

    private List<ExtractedSkillDto> parseSkillsJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<ExtractedSkillDto>>() {});
        } catch (Exception e) {
            log.warn("Failed to deserialize parsed skills json: {}", e.getMessage());
            return List.of();
        }
    }

    private List<String> parseStringListJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to deserialize json list: {}", e.getMessage());
            return List.of();
        }
    }
}
