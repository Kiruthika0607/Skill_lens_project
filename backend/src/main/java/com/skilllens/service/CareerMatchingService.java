package com.skilllens.service;

import com.skilllens.dto.CareerMatchResponse;
import com.skilllens.dto.PrioritizedSkillDto;
import com.skilllens.entity.Occupation;
import com.skilllens.entity.OccupationSkill;
import com.skilllens.entity.StudentProfile;
import com.skilllens.entity.StudentSkill;
import com.skilllens.repository.OccupationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerMatchingService {

    private final OccupationRepository occupationRepository;
    private final StudentProfileService studentProfileService;

    /**
     * Deterministic Weighted Career Match Calculation
     */
    public CareerMatchResponse calculateMatch(StudentProfile profile, Occupation occupation) {
        Set<Long> studentSkillIds = profile.getSkills().stream()
                .map(ss -> ss.getSkill().getId())
                .collect(Collectors.toSet());

        Set<OccupationSkill> occupationSkills = occupation.getRequiredSkills();

        if (occupationSkills.isEmpty()) {
            return CareerMatchResponse.builder()
                    .occupationId(occupation.getId())
                    .occupationTitle(occupation.getTitle())
                    .description(occupation.getDescription())
                    .industryDemand(occupation.getIndustryDemand())
                    .matchPercentage(0.0)
                    .readinessScore(0.0)
                    .matchedSkillCount(0)
                    .totalSkillCount(0)
                    .matchedSkills(Collections.emptyList())
                    .missingSkills(Collections.emptyList())
                    .priorityGaps(Collections.emptyList())
                    .build();
        }

        BigDecimal totalWeight = BigDecimal.ZERO;
        BigDecimal matchedWeight = BigDecimal.ZERO;

        BigDecimal totalRequiredWeight = BigDecimal.ZERO;
        BigDecimal matchedRequiredWeight = BigDecimal.ZERO;

        List<String> matchedSkillNames = new ArrayList<>();
        List<String> missingSkillNames = new ArrayList<>();
        List<PrioritizedSkillDto> priorityGaps = new ArrayList<>();

        for (OccupationSkill os : occupationSkills) {
            BigDecimal weight = os.getWeight() != null ? os.getWeight() : BigDecimal.valueOf(1.0);
            totalWeight = totalWeight.add(weight);

            if (os.isRequired()) {
                totalRequiredWeight = totalRequiredWeight.add(weight);
            }

            boolean studentHasSkill = studentSkillIds.contains(os.getSkill().getId());

            if (studentHasSkill) {
                matchedWeight = matchedWeight.add(weight);
                matchedSkillNames.add(os.getSkill().getName());
                if (os.isRequired()) {
                    matchedRequiredWeight = matchedRequiredWeight.add(weight);
                }
            } else {
                missingSkillNames.add(os.getSkill().getName());

                // Classify priority with rationale
                String priority = determinePriority(os);
                String reason = generatePriorityReason(os, occupation.getTitle());

                priorityGaps.add(PrioritizedSkillDto.builder()
                        .skillId(os.getSkill().getId())
                        .skillName(os.getSkill().getName())
                        .categoryName(os.getSkill().getCategory().getName())
                        .priority(priority)
                        .required(os.isRequired())
                        .reason(reason)
                        .demandLevel(os.getSkill().getDemandLevel())
                        .build());
            }
        }

        // Overall Weighted Match %
        double matchPercentage = totalWeight.compareTo(BigDecimal.ZERO) > 0
                ? matchedWeight.divide(totalWeight, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                : 0.0;

        // Core Required Skills Readiness %
        double readinessScore = totalRequiredWeight.compareTo(BigDecimal.ZERO) > 0
                ? matchedRequiredWeight.divide(totalRequiredWeight, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                : matchPercentage;

        // Round to 1 decimal place
        matchPercentage = Math.round(matchPercentage * 10.0) / 10.0;
        readinessScore = Math.round(readinessScore * 10.0) / 10.0;

        // Sort priority gaps: HIGH first, then MEDIUM, then LOW
        priorityGaps.sort(Comparator.comparingInt(this::getPrioritySortWeight));

        return CareerMatchResponse.builder()
                .occupationId(occupation.getId())
                .occupationTitle(occupation.getTitle())
                .description(occupation.getDescription())
                .industryDemand(occupation.getIndustryDemand())
                .matchPercentage(matchPercentage)
                .readinessScore(readinessScore)
                .matchedSkillCount(matchedSkillNames.size())
                .totalSkillCount(occupationSkills.size())
                .matchedSkills(matchedSkillNames)
                .missingSkills(missingSkillNames)
                .priorityGaps(priorityGaps)
                .build();
    }

    public CareerMatchResponse getMatchForCurrentStudent(Long occupationId) {
        StudentProfile profile = studentProfileService.getCurrentStudentProfile();
        Occupation occupation = occupationRepository.findById(occupationId)
                .orElseThrow(() -> new RuntimeException("Occupation not found with ID: " + occupationId));
        return calculateMatch(profile, occupation);
    }

    /**
     * Recommends Top 3 Careers for Current Student based on Skills, Interest & Market Demand
     */
    public List<CareerMatchResponse> getTopRecommendedCareers() {
        StudentProfile profile = studentProfileService.getCurrentStudentProfile();
        List<Occupation> allOccupations = occupationRepository.findAll();

        List<CareerMatchResponse> matches = allOccupations.stream()
                .map(occ -> calculateMatch(profile, occ))
                .sorted((a, b) -> {
                    // Hybrid score combining match percentage (60%) and readiness (40%)
                    double scoreA = (a.getMatchPercentage() * 0.6) + (a.getReadinessScore() * 0.4);
                    double scoreB = (b.getMatchPercentage() * 0.6) + (b.getReadinessScore() * 0.4);

                    // Boost if student explicitly noted career interest
                    if (profile.getCareerInterest() != null && !profile.getCareerInterest().isEmpty()) {
                        if (a.getOccupationTitle().toLowerCase().contains(profile.getCareerInterest().toLowerCase())) {
                            scoreA += 15.0;
                        }
                        if (b.getOccupationTitle().toLowerCase().contains(profile.getCareerInterest().toLowerCase())) {
                            scoreB += 15.0;
                        }
                    }

                    return Double.compare(scoreB, scoreA);
                })
                .limit(3)
                .collect(Collectors.toList());

        return matches;
    }

    private String determinePriority(OccupationSkill os) {
        String skillDemand = os.getSkill().getDemandLevel();
        if (os.isRequired() && ("CRITICAL".equalsIgnoreCase(skillDemand) || "HIGH".equalsIgnoreCase(skillDemand))) {
            return "HIGH";
        }
        if (os.isRequired() || "HIGH".equalsIgnoreCase(skillDemand)) {
            return "MEDIUM";
        }
        return "LOW";
    }

    private String generatePriorityReason(OccupationSkill os, String occupationTitle) {
        if (os.isRequired()) {
            return "Mandatory core prerequisite for " + occupationTitle + " with " + os.getSkill().getDemandLevel() + " market demand.";
        }
        return "Recommended industry skill that enhances candidate competitiveness for " + occupationTitle + ".";
    }

    private int getPrioritySortWeight(PrioritizedSkillDto dto) {
        switch (dto.getPriority().toUpperCase()) {
            case "HIGH": return 1;
            case "MEDIUM": return 2;
            case "LOW": return 3;
            default: return 4;
        }
    }
}
