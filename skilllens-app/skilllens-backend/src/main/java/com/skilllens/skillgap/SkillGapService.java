package com.skilllens.skillgap;

import com.skilllens.career.CareerRequiredSkill;
import com.skilllens.career.CareerRequiredSkillRepository;
import com.skilllens.career.CareerRole;
import com.skilllens.career.CareerRoleRepository;
import com.skilllens.common.exception.BadRequestException;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Skill gap calculation service.
 * <p>
 * Formula for individual skill gap (gᵢ):
 * <pre>
 *   gᵢ = max(0, Rᵢ - Sᵢ) / Rᵢ
 * </pre>
 * where Rᵢ = required proficiency, Sᵢ = assessed proficiency.
 * <p>
 * Weighted aggregate gap:
 * <pre>
 *   Gap% = (Σ wᵢ × gᵢ) / (Σ wᵢ) × 100
 * </pre>
 * <p>
 * Unassessed skills are NOT silently treated as zero. They are flagged
 * with {@code assessmentStatus = "NOT_ASSESSED"} and excluded from the
 * aggregate denominator unless explicitly configured otherwise.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillGapService {

    private final CareerRoleRepository careerRoleRepository;
    private final CareerRequiredSkillRepository requiredSkillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public SkillGapReport calculateGap(UserPrincipal principal, Long careerId) {
        CareerRole career = careerRoleRepository.findById(careerId)
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found: " + careerId));

        List<CareerRequiredSkill> requirements = requiredSkillRepository.findByCareerId(careerId);
        if (requirements.isEmpty()) {
            return SkillGapReport.builder()
                    .careerId(careerId).careerTitle(career.getTitle())
                    .overallGapPercentage(0.0).gapItems(List.of())
                    .methodology("No skill requirements defined for this career role.")
                    .calculatedAt(Instant.now()).build();
        }

        // Validate requirements
        for (CareerRequiredSkill req : requirements) {
            if (req.getMinProficiency() <= 0) {
                throw new BadRequestException(
                        "Invalid required proficiency level " + req.getMinProficiency() +
                        " for skill " + req.getSkillId() + ". Must be > 0.");
            }
            if (req.getWeight() <= 0) {
                throw new BadRequestException("Skill weight must be > 0 for skill " + req.getSkillId());
            }
        }

        Map<Long, StudentSkill> studentSkillMap = studentSkillRepository.findByUserId(principal.getId())
                .stream()
                .collect(Collectors.toMap(ss -> ss.getSkill().getId(), ss -> ss, (first, ignored) -> first));

        Map<Long, String> skillNames = new HashMap<>();
        requirements.forEach(req -> skillRepository.findById(req.getSkillId())
                .ifPresent(s -> skillNames.put(s.getId(), s.getName())));

        // Build gap items
        List<SkillGapItem> gapItems = new ArrayList<>();
        double weightedGapSum = 0.0;
        double evaluatedWeightSum = 0.0;
        int assessedSkillCount = 0;
        int selfReportedSkillCount = 0;

        for (CareerRequiredSkill req : requirements) {
            StudentSkill studentSkill = studentSkillMap.get(req.getSkillId());
            Integer assessed = studentSkill == null ? null : studentSkill.getAssessedProficiency();
            Integer selfReported = studentSkill == null ? null : studentSkill.getSelfReportedProficiency();
            Integer current = assessed != null ? assessed : selfReported;
            String assessmentStatus;
            String proficiencySource;
            double normalizedGap;

            if (current == null) {
                assessmentStatus = "NOT_ASSESSED";
                proficiencySource = "NONE";
                normalizedGap = Double.NaN;
            } else {
                proficiencySource = assessed != null ? "ASSESSMENT" : "SELF_REPORTED";
                assessmentStatus = current >= req.getMinProficiency() ? "MET" : "BELOW_REQUIREMENT";
                double rawGap = Math.max(0, req.getMinProficiency() - current);
                normalizedGap = rawGap / req.getMinProficiency();
                weightedGapSum += req.getWeight() * normalizedGap;
                evaluatedWeightSum += req.getWeight();
                if (assessed != null) {
                    assessedSkillCount++;
                } else {
                    selfReportedSkillCount++;
                }
            }

            gapItems.add(SkillGapItem.builder()
                    .skillId(req.getSkillId())
                    .skillName(skillNames.getOrDefault(req.getSkillId(), "Unknown"))
                    .requiredProficiency(req.getMinProficiency())
                    .assessedProficiency(assessed)
                    .currentProficiency(current)
                    .proficiencySource(proficiencySource)
                    .weight(req.getWeight())
                    .normalizedGap(Double.isNaN(normalizedGap) ? null : Math.round(normalizedGap * 1000.0) / 1000.0)
                    .assessmentStatus(assessmentStatus)
                    .build());
        }

        double overallGap = evaluatedWeightSum > 0
                ? (weightedGapSum / evaluatedWeightSum) * 100.0
                : Double.NaN;  // Cannot compute without any assessed skills

        long notAssessedCount = gapItems.stream()
                .filter(i -> "NOT_ASSESSED".equals(i.getAssessmentStatus())).count();

        String methodology = String.format(
                "Weighted gap: Σ(wᵢ × gᵢ) / Σ(wᵢ) × 100. " +
                "gᵢ = max(0, Rᵢ - Sᵢ) / Rᵢ. " +
                "Assessed levels are used first; self-reported levels, including resume-imported skills, are used when no assessment exists. " +
                "%d assessed and %d self-reported skills of %d are included; %d skills have no proficiency data.",
                assessedSkillCount, selfReportedSkillCount, requirements.size(), notAssessedCount);

        return SkillGapReport.builder()
                .careerId(careerId).careerTitle(career.getTitle())
                .overallGapPercentage(Double.isNaN(overallGap) ? null :
                        Math.round(overallGap * 10.0) / 10.0)
                .assessedSkillCount(assessedSkillCount)
                .selfReportedSkillCount(selfReportedSkillCount)
                .totalRequiredSkillCount(requirements.size())
                .notAssessedCount((int) notAssessedCount)
                .gapItems(gapItems)
                .methodology(methodology)
                .calculatedAt(Instant.now())
                .build();
    }
}
