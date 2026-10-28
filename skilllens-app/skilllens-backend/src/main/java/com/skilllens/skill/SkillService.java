package com.skilllens.skill;

import com.skilllens.common.dto.PagedResponse;
import com.skilllens.common.exception.BadRequestException;
import com.skilllens.common.exception.ConflictException;
import com.skilllens.common.exception.ForbiddenException;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.common.util.PaginationUtil;
import com.skilllens.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Skill management service.
 */
@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillCategoryRepository categoryRepository;

    // ─── Catalog ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<SkillResponse> searchSkills(String search, int page, int size) {
        Pageable pageable = PaginationUtil.toPageable(page, size, "name", "ASC");
        Page<Skill> result = skillRepository.searchSkills(search, pageable);
        return PaginationUtil.toPagedResponse(result, this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<SkillCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public SkillResponse createSkill(CreateSkillRequest request) {
        SkillCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill category not found with id: " + request.getCategoryId()));

        Skill skill = Skill.builder()
                .name(request.getName().trim())
                .category(category)
                .description(request.getDescription())
                .tags(request.getTags() != null ? request.getTags() : "")
                .active(true)
                .build();

        skill = skillRepository.save(skill);
        return toResponse(skill);
    }

    // ─── Student skills ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StudentSkillResponse> getStudentSkills(UserPrincipal principal) {
        return studentSkillRepository.findByUserId(principal.getId())
                .stream().map(this::toStudentSkillResponse).collect(Collectors.toList());
    }

    @Transactional
    public StudentSkillResponse addStudentSkill(UserPrincipal principal, AddStudentSkillRequest request) {
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + request.getSkillId()));

        if (studentSkillRepository.existsByUserIdAndSkillId(principal.getId(), skill.getId())) {
            throw new ConflictException("You have already added this skill.");
        }

        validateProficiencyLevel(request.getSelfReportedProficiency());

        StudentSkill ss = StudentSkill.builder()
                .userId(principal.getId())
                .skill(skill)
                .selfReportedProficiency(request.getSelfReportedProficiency())
                .notes(request.getNotes())
                .build();
        ss = studentSkillRepository.save(ss);
        return toStudentSkillResponse(ss);
    }

    @Transactional
    public StudentSkillResponse updateStudentSkill(UserPrincipal principal, Long studentSkillId,
                                                   UpdateStudentSkillRequest request) {
        StudentSkill ss = studentSkillRepository.findById(studentSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("Student skill record not found."));

        if (!ss.getUserId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to modify this record.");
        }

        validateProficiencyLevel(request.getSelfReportedProficiency());
        ss.setSelfReportedProficiency(request.getSelfReportedProficiency());
        if (request.getNotes() != null) ss.setNotes(request.getNotes());

        ss = studentSkillRepository.save(ss);
        return toStudentSkillResponse(ss);
    }

    @Transactional
    public void removeStudentSkill(UserPrincipal principal, Long studentSkillId) {
        StudentSkill ss = studentSkillRepository.findById(studentSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("Student skill record not found."));

        if (!ss.getUserId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to modify this record.");
        }
        studentSkillRepository.delete(ss);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void validateProficiencyLevel(Integer level) {
        if (level != null && (level < 0 || level > 4)) {
            throw new BadRequestException("Proficiency level must be between 0 and 4.");
        }
    }

    SkillResponse toResponse(Skill s) {
        return SkillResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .categoryId(s.getCategory() != null ? s.getCategory().getId() : null)
                .categoryName(s.getCategory() != null ? s.getCategory().getName() : null)
                .tags(s.getTags())
                .build();
    }

    StudentSkillResponse toStudentSkillResponse(StudentSkill ss) {
        return StudentSkillResponse.builder()
                .id(ss.getId())
                .skillId(ss.getSkill().getId())
                .skillName(ss.getSkill().getName())
                .skillCategory(ss.getSkill().getCategory() != null ? ss.getSkill().getCategory().getName() : null)
                .selfReportedProficiency(ss.getSelfReportedProficiency())
                .assessedProficiency(ss.getAssessedProficiency())
                .lastAssessedAt(ss.getLastAssessedAt())
                .notes(ss.getNotes())
                .createdAt(ss.getCreatedAt())
                .build();
    }
}
