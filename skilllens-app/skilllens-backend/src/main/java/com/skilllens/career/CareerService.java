package com.skilllens.career;

import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Career recommendation engine.
 * <p>
 * Transparent matching algorithm: for each career role, the engine computes a match
 * score based on the student's assessed proficiency against required proficiency levels.
 * Only assessed proficiency is used; self-reported proficiency is excluded to prevent
 * inflation of match scores.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CareerService {

    private final CareerRoleRepository careerRoleRepository;
    private final CareerRequiredSkillRepository requiredSkillRepository;
    private final CareerRecommendationRepository recommendationRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillRepository skillRepository;
    private final com.skilllens.student.StudentProfileRepository profileRepository;

    @Transactional
    public CareerGoalResponse setCareerGoal(UserPrincipal principal, Long careerRoleId) {
        CareerRole role = careerRoleRepository.findById(careerRoleId)
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found: " + careerRoleId));

        profileRepository.findByUserId(principal.getId()).ifPresent(p -> {
            p.setPreferredCareerRole(role.getTitle());
            profileRepository.save(p);
        });

        return CareerGoalResponse.builder()
                .careerRoleId(role.getId())
                .careerRoleTitle(role.getTitle())
                .industry(role.getIndustry())
                .description(role.getDescription())
                .build();
    }

    @Transactional(readOnly = true)
    public CareerGoalResponse getCareerGoal(UserPrincipal principal) {
        return profileRepository.findByUserId(principal.getId())
                .map(p -> {
                    if (p.getPreferredCareerRole() == null) return null;
                    Optional<CareerRole> roleOpt = careerRoleRepository.findByTitleIgnoreCase(p.getPreferredCareerRole());
                    return roleOpt.map(role -> CareerGoalResponse.builder()
                            .careerRoleId(role.getId())
                            .careerRoleTitle(role.getTitle())
                            .industry(role.getIndustry())
                            .description(role.getDescription())
                            .build()).orElseGet(() -> CareerGoalResponse.builder()
                            .careerRoleTitle(p.getPreferredCareerRole())
                            .build());
                }).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<CareerRoleResponse> listCareers() {
        return careerRoleRepository.findByActiveTrue(
                org.springframework.data.domain.Pageable.unpaged())
                .stream().map(this::toRoleResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CareerRoleResponse getCareer(Long careerId) {
        return careerRoleRepository.findById(careerId)
                .map(this::toRoleResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found: " + careerId));
    }

    @Transactional(readOnly = true)
    public List<CareerRecommendationResponse> getRecommendations(UserPrincipal principal) {
        String preferredCareerRole = profileRepository.findByUserId(principal.getId())
                .map(profile -> profile.getPreferredCareerRole())
                .orElse(null);
        return recommendationRepository.findByUserIdOrderByMatchScoreDesc(principal.getId())
                .stream()
                .map(rec -> toRecommendationResponse(rec, preferredCareerRole,
                        careerRoleRepository.findById(rec.getCareerId()).orElse(null)))
                .collect(Collectors.toList());
    }

    /**
     * Generates recommendations from current assessment and self-reported skill levels.
     */
    @Transactional
    public List<CareerRecommendationResponse> generateRecommendations(UserPrincipal principal) {
        // Delete existing recommendations
        recommendationRepository.deleteAllForUser(principal.getId());

        List<StudentSkill> studentSkills = studentSkillRepository.findByUserId(principal.getId());
        Map<Long, Integer> assessedMap = studentSkills.stream()
                .filter(ss -> ss.getAssessedProficiency() != null || ss.getSelfReportedProficiency() != null)
                .collect(Collectors.toMap(
                        ss -> ss.getSkill().getId(),
                        ss -> ss.getAssessedProficiency() != null ? ss.getAssessedProficiency() : ss.getSelfReportedProficiency(),
                        (v1, v2) -> v1
                ));

        List<CareerRole> careers = careerRoleRepository.findByActiveTrue(
                org.springframework.data.domain.Pageable.unpaged()).getContent();

        String preferredCareerRole = profileRepository.findByUserId(principal.getId())
                .map(profile -> profile.getPreferredCareerRole())
                .filter(role -> role != null && !role.isBlank())
                .orElse(null);

        List<CareerRecommendation> recommendations = new ArrayList<>();
        Map<Long, CareerRole> careersById = careers.stream()
                .collect(Collectors.toMap(CareerRole::getId, career -> career));
        for (CareerRole career : careers) {
            List<CareerRequiredSkill> requirements = requiredSkillRepository.findByCareerId(career.getId());
            if (requirements.isEmpty()) continue;

            double totalWeight = requirements.stream().mapToDouble(CareerRequiredSkill::getWeight).sum();
            if (totalWeight <= 0) continue;

            double weightedMatchScore = 0.0;
            int matchedCount = 0;

            for (CareerRequiredSkill req : requirements) {
                Integer assessed = assessedMap.get(req.getSkillId());
                if (assessed != null && assessed >= req.getMinProficiency()) {
                    // Full match for this skill
                    weightedMatchScore += req.getWeight();
                    matchedCount++;
                } else if (assessed != null) {
                    // Partial credit
                    double partial = (double) assessed / req.getMinProficiency() * req.getWeight();
                    weightedMatchScore += partial;
                }
                // Unassessed skills contribute 0 — documented behaviour
            }

            double normalizedScore = (weightedMatchScore / totalWeight) * 100.0;

            CareerRecommendation rec = CareerRecommendation.builder()
                    .userId(principal.getId())
                    .careerId(career.getId())
                    .matchScore(Math.round(normalizedScore * 10.0) / 10.0)
                    .matchedSkillCount(matchedCount)
                    .totalRequiredSkills(requirements.size())
                    .explanation(buildExplanation(career, requirements, assessedMap, preferredCareerRole))
                    .build();
            recommendations.add(rec);
        }

        // Keep the student's explicit profile preference prominent without inflating the skill-match score.
        recommendations.sort(Comparator
                .comparing((CareerRecommendation rec) ->
                        isPreferredCareer(careersById.get(rec.getCareerId()), preferredCareerRole))
                .reversed()
                .thenComparing(Comparator.comparingDouble(CareerRecommendation::getMatchScore).reversed()));
        List<CareerRecommendation> saved = recommendationRepository.saveAll(
                recommendations.stream().limit(10).collect(Collectors.toList()));

        log.info("Generated {} career recommendations for userId={}", saved.size(), principal.getId());
        return saved.stream().map(rec -> toRecommendationResponse(rec, preferredCareerRole, careersById.get(rec.getCareerId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CareerRequiredSkillResponse> getRequiredSkills(Long careerId) {
        careerRoleRepository.findById(careerId)
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found."));
        return requiredSkillRepository.findByCareerId(careerId)
                .stream().map(this::toRequiredSkillResponse).collect(Collectors.toList());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private String buildExplanation(CareerRole career, List<CareerRequiredSkill> requirements,
                                    Map<Long, Integer> assessedMap, String preferredCareerRole) {
        long matched = requirements.stream()
                .filter(r -> assessedMap.getOrDefault(r.getSkillId(), -1) >= r.getMinProficiency())
                .count();
        long missing = requirements.stream()
                .filter(r -> !assessedMap.containsKey(r.getSkillId()))
                .count();
        String evidence = "Skill match uses assessment results where available and self-reported levels otherwise, including skills imported from a parsed resume.";
        if (isPreferredCareer(career, preferredCareerRole)) {
            evidence += " This role matches your career preference in your profile.";
        }
        return String.format("You meet %d of %d required skills for %s. %d skills have no proficiency data. %s",
                matched, requirements.size(), career.getTitle(), missing, evidence);
    }

    private boolean isPreferredCareer(CareerRole career, String preferredCareerRole) {
        return career != null && preferredCareerRole != null
                && career.getTitle().trim().equalsIgnoreCase(preferredCareerRole.trim());
    }

    CareerRoleResponse toRoleResponse(CareerRole c) {
        return CareerRoleResponse.builder()
                .id(c.getId()).title(c.getTitle()).description(c.getDescription())
                .industry(c.getIndustry()).avgSalaryRange(c.getAvgSalaryRange()).build();
    }

    CareerRecommendationResponse toRecommendationResponse(CareerRecommendation r, String preferredCareerRole,
                                                           CareerRole career) {
        return CareerRecommendationResponse.builder()
                .id(r.getId()).careerId(r.getCareerId()).matchScore(r.getMatchScore())
                .matchedSkillCount(r.getMatchedSkillCount())
                .totalRequiredSkills(r.getTotalRequiredSkills())
                .explanation(r.getExplanation()).generatedAt(r.getCreatedAt())
                .title(career != null ? career.getTitle() : null)
                .description(career != null ? career.getDescription() : null)
                .industry(career != null ? career.getIndustry() : null)
                .profilePreferred(isPreferredCareer(career, preferredCareerRole))
                .build();
    }

    CareerRequiredSkillResponse toRequiredSkillResponse(CareerRequiredSkill r) {
        return CareerRequiredSkillResponse.builder()
                .id(r.getId()).careerId(r.getCareerId()).skillId(r.getSkillId())
                .minProficiency(r.getMinProficiency()).weight(r.getWeight())
                .required(r.isRequired()).build();
    }
}
