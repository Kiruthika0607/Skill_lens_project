package com.skilllens.service;

import com.skilllens.dto.CareerMatchResponse;
import com.skilllens.dto.PrioritizedSkillDto;
import com.skilllens.dto.SkillGapAnalysisResponse;
import com.skilllens.entity.Occupation;
import com.skilllens.entity.StudentProfile;
import com.skilllens.entity.StudentSkill;
import com.skilllens.repository.OccupationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillGapService {

    private final StudentProfileService studentProfileService;
    private final CareerMatchingService careerMatchingService;
    private final OccupationRepository occupationRepository;

    public SkillGapAnalysisResponse getSkillGapAnalysisForCurrentStudent() {
        StudentProfile profile = studentProfileService.getCurrentStudentProfile();

        // Determine target occupation: selected target or top recommended
        Occupation targetOccupation = null;
        if (profile.getTargetOccupationId() != null) {
            targetOccupation = occupationRepository.findById(profile.getTargetOccupationId()).orElse(null);
        }

        if (targetOccupation == null) {
            List<Occupation> all = occupationRepository.findAll();
            if (!all.isEmpty()) {
                targetOccupation = all.get(0);
            }
        }

        if (targetOccupation == null) {
            return SkillGapAnalysisResponse.builder()
                    .targetOccupationId(null)
                    .targetOccupationTitle("No Occupations Available")
                    .careerReadinessScore(0.0)
                    .careerMatchScore(0.0)
                    .currentSkillCount(0)
                    .matchedSkillCount(0)
                    .missingSkillCount(0)
                    .currentSkills(Collections.emptyList())
                    .matchedSkills(Collections.emptyList())
                    .missingSkills(Collections.emptyList())
                    .highPrioritySkills(Collections.emptyList())
                    .mediumPrioritySkills(Collections.emptyList())
                    .lowPrioritySkills(Collections.emptyList())
                    .build();
        }

        CareerMatchResponse match = careerMatchingService.calculateMatch(profile, targetOccupation);

        List<String> currentSkills = profile.getSkills().stream()
                .map(ss -> ss.getSkill().getName())
                .collect(Collectors.toList());

        List<PrioritizedSkillDto> high = match.getPriorityGaps().stream()
                .filter(g -> "HIGH".equalsIgnoreCase(g.getPriority()))
                .collect(Collectors.toList());

        List<PrioritizedSkillDto> medium = match.getPriorityGaps().stream()
                .filter(g -> "MEDIUM".equalsIgnoreCase(g.getPriority()))
                .collect(Collectors.toList());

        List<PrioritizedSkillDto> low = match.getPriorityGaps().stream()
                .filter(g -> "LOW".equalsIgnoreCase(g.getPriority()))
                .collect(Collectors.toList());

        return SkillGapAnalysisResponse.builder()
                .targetOccupationId(targetOccupation.getId())
                .targetOccupationTitle(targetOccupation.getTitle())
                .careerReadinessScore(match.getReadinessScore())
                .careerMatchScore(match.getMatchPercentage())
                .currentSkillCount(currentSkills.size())
                .matchedSkillCount(match.getMatchedSkillCount())
                .missingSkillCount(match.getMissingSkills().size())
                .currentSkills(currentSkills)
                .matchedSkills(match.getMatchedSkills())
                .missingSkills(match.getMissingSkills())
                .highPrioritySkills(high)
                .mediumPrioritySkills(medium)
                .lowPrioritySkills(low)
                .build();
    }
}
