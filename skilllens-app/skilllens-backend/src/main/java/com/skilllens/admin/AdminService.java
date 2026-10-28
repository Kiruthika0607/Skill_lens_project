package com.skilllens.admin;

import com.skilllens.assessment.*;
import com.skilllens.audit.AuditLogResponse;
import com.skilllens.audit.AuditService;
import com.skilllens.career.CareerRequiredSkill;
import com.skilllens.career.CareerRequiredSkillRepository;
import com.skilllens.career.CareerRole;
import com.skilllens.career.CareerRoleRepository;
import com.skilllens.common.dto.PagedResponse;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.common.util.PaginationUtil;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.user.User;
import com.skilllens.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CareerRoleRepository careerRoleRepository;
    private final CareerRequiredSkillRepository requiredSkillRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final SkillRepository skillRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PagedResponse<UserSummaryResponse> listUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return PaginationUtil.toPagedResponse(page.map(this::mapUserToSummary));
    }

    @Transactional
    public UserSummaryResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Boolean active = request.getIsActive() != null ? request.getIsActive() : request.getEnabled();
        if (active != null) {
            user.setEnabled(active);
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        user = userRepository.save(user);
        log.info("Admin updated user {} status: enabled={}, role={}", user.getId(), user.isEnabled(), user.getRole());
        return mapUserToSummary(user);
    }

    @Transactional
    public CareerRole createCareerRole(CreateCareerRoleRequest request) {
        CareerRole role = CareerRole.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .industry(request.getIndustrySector())
                .avgSalaryRange(request.getAverageSalaryMin() != null && request.getAverageSalaryMax() != null
                        ? "$" + request.getAverageSalaryMin() + " - $" + request.getAverageSalaryMax()
                        : null)
                .active(true)
                .build();

        role = careerRoleRepository.save(role);

        if (request.getRequiredSkills() != null && !request.getRequiredSkills().isEmpty()) {
            List<CareerRequiredSkill> reqSkills = new ArrayList<>();
            for (CreateCareerRoleRequest.RequiredSkillInput input : request.getRequiredSkills()) {
                reqSkills.add(CareerRequiredSkill.builder()
                        .careerId(role.getId())
                        .skillId(input.getSkillId())
                        .weight(input.getWeight() != null ? input.getWeight() : 1.0)
                        .minProficiency(input.getMinProficiency() != null ? input.getMinProficiency() : 1)
                        .required(true)
                        .build());
            }
            requiredSkillRepository.saveAll(reqSkills);
        }

        return role;
    }

    @Transactional
    public void deleteCareerRole(Long id) {
        CareerRole role = careerRoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found: " + id));
        role.setActive(false);
        careerRoleRepository.save(role);
    }

    @Transactional
    public Assessment createAssessment(CreateAssessmentRequest request) {
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + request.getSkillId()));

        Assessment assessment = Assessment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .skillId(skill.getId())
                .difficulty(Assessment.Difficulty.INTERMEDIATE)
                .timeLimitMinutes(request.getTimeLimitMinutes())
                .passingScore(request.getPassingScorePercentage() != null ? request.getPassingScorePercentage().intValue() : 70)
                .active(true)
                .build();

        assessment = assessmentRepository.save(assessment);

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            int qIndex = 0;
            for (CreateAssessmentRequest.QuestionInput qi : request.getQuestions()) {
                AssessmentQuestion q = AssessmentQuestion.builder()
                        .assessmentId(assessment.getId())
                        .questionText(qi.getQuestionText())
                        .questionType(AssessmentQuestion.QuestionType.SINGLE_CHOICE)
                        .points(qi.getPoints() != null ? qi.getPoints() : 1)
                        .orderIndex(qIndex++)
                        .build();

                if (qi.getOptions() != null) {
                    List<AssessmentOption> options = new ArrayList<>();
                    int oIndex = 0;
                    for (CreateAssessmentRequest.OptionInput oi : qi.getOptions()) {
                        options.add(AssessmentOption.builder()
                                .optionText(oi.getOptionText())
                                .correct(Boolean.TRUE.equals(oi.getIsCorrect()))
                                .orderIndex(oIndex++)
                                .build());
                    }
                    q.setOptions(options);
                }
                questionRepository.save(q);
            }
        }

        return assessment;
    }

    @Transactional
    public void deleteAssessment(Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found: " + id));
        assessment.setActive(false);
        assessmentRepository.save(assessment);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> getAuditLogs(Long userId, String action, Instant fromTime, Instant toTime, Pageable pageable) {
        return auditService.searchAuditLogs(userId, action, fromTime, toTime, pageable);
    }

    private UserSummaryResponse mapUserToSummary(User u) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .role(u.getRole())
                .isActive(u.isEnabled())
                .isEmailVerified(u.isEmailVerified())
                .createdAt(u.getCreatedAt())
                .lastLoginAt(u.getLastLoginAt())
                .build();
    }
}
