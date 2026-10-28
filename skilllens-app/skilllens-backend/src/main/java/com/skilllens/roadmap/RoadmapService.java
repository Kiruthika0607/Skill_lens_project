package com.skilllens.roadmap;

import com.skilllens.career.CareerRequiredSkill;
import com.skilllens.career.CareerRequiredSkillRepository;
import com.skilllens.career.CareerRole;
import com.skilllens.career.CareerRoleRepository;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.common.exception.BadRequestException;
import com.skilllens.security.UserPrincipal;
import com.skilllens.assessment.Assessment;
import com.skilllens.assessment.AssessmentAttempt;
import com.skilllens.assessment.AssessmentAttemptRepository;
import com.skilllens.assessment.AssessmentRepository;
import com.skilllens.resource.LearningResource;
import com.skilllens.resource.LearningResourceRepository;
import com.skilllens.resource.SavedResource;
import com.skilllens.resource.SavedResourceRepository;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final RoadmapMilestoneRepository milestoneRepository;
    private final CareerRoleRepository careerRoleRepository;
    private final CareerRequiredSkillRepository requiredSkillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillRepository skillRepository;
    private final LearningResourceRepository learningResourceRepository;
    private final SavedResourceRepository savedResourceRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;

    @Transactional
    public RoadmapResponse generateRoadmap(UserPrincipal principal, GenerateRoadmapRequest request) {
        CareerRole career = careerRoleRepository.findById(request.getCareerRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Career role not found with id: " + request.getCareerRoleId()));

        List<CareerRequiredSkill> requirements = requiredSkillRepository.findByCareerId(career.getId());

        Map<Long, Integer> assessedSkills = studentSkillRepository.findByUserId(principal.getId())
                .stream()
                .filter(s -> s.getAssessedProficiency() != null || s.getSelfReportedProficiency() != null)
                .collect(Collectors.toMap(s -> s.getSkill().getId(),
                        s -> s.getAssessedProficiency() != null
                                ? s.getAssessedProficiency() : s.getSelfReportedProficiency()));

        String title = (request.getCustomTitle() != null && !request.getCustomTitle().isBlank())
                ? request.getCustomTitle()
                : "Personalized Career Pathway: " + career.getTitle();

        Roadmap roadmap = Roadmap.builder()
                .userId(principal.getId())
                .targetCareerRole(career)
                .title(title)
                .description("Actionable learning and milestone pathway tailored to achieve " + career.getTitle() + " requirements.")
                .status(RoadmapStatus.ACTIVE)
                .totalMilestones(0)
                .completedMilestones(0)
                .build();

        roadmap = roadmapRepository.save(roadmap);

        // Sort requirements: skills with largest gap or not assessed first, prioritized by weight descending
        List<CareerRequiredSkill> sortedRequirements = new ArrayList<>(requirements);
        sortedRequirements.sort((a, b) -> {
            int gapA = a.getMinProficiency() - assessedSkills.getOrDefault(a.getSkillId(), 0);
            int gapB = b.getMinProficiency() - assessedSkills.getOrDefault(b.getSkillId(), 0);
            int gapComp = Integer.compare(gapB, gapA);
            if (gapComp != 0) return gapComp;
            return Double.compare(b.getWeight(), a.getWeight());
        });

        List<RoadmapMilestone> milestones = new ArrayList<>();
        int order = 1;

        for (CareerRequiredSkill req : sortedRequirements) {
            Skill skill = skillRepository.findById(req.getSkillId()).orElse(null);
            if (skill == null) continue;

            Integer currentLevel = assessedSkills.get(skill.getId());
            String desc;
            if (currentLevel == null) {
                desc = String.format("Complete the provided learning resources for %s, then pass a skill assessment to demonstrate target proficiency level %d.",
                        skill.getName(), req.getMinProficiency());
            } else if (currentLevel < req.getMinProficiency()) {
                desc = String.format("Complete the resources for %s, build targeted practice projects, and pass its assessment to reach required level %d (current level %d).",
                        skill.getName(), req.getMinProficiency(), currentLevel);
            } else {
                desc = String.format("Review the provided resources for %s and pass its assessment to validate the required proficiency level %d.",
                        skill.getName(), req.getMinProficiency());
            }

            milestones.add(RoadmapMilestone.builder()
                    .roadmap(roadmap)
                    .milestoneOrder(order++)
                    .title("Master " + skill.getName() + " (Target Level: " + req.getMinProficiency() + ")")
                    .description(desc)
                    .targetSkill(skill)
                    .targetProficiency(req.getMinProficiency())
                    .status(MilestoneStatus.NOT_STARTED)
                    .estimatedWeeks(Math.max(2, req.getMinProficiency()))
                    .build());
        }

        // Add a final capstone project milestone
        milestones.add(RoadmapMilestone.builder()
                .roadmap(roadmap)
                .milestoneOrder(order)
                .title("Complete Capstone Portfolio Project & Mock Interview")
                .description("Build a comprehensive end-to-end project demonstrating skills required for " + career.getTitle() + ", update your resume, and conduct technical interview practice.")
                .targetSkill(null)
                .targetProficiency(5)
                .status(MilestoneStatus.NOT_STARTED)
                .estimatedWeeks(3)
                .build());

        milestoneRepository.saveAll(milestones);
        roadmap.setTotalMilestones(milestones.size());
        roadmap.setMilestones(milestones);
        roadmap = roadmapRepository.save(roadmap);

        log.info("Generated roadmap {} with {} milestones for user {} targeting career {}",
                roadmap.getId(), milestones.size(), principal.getId(), career.getTitle());

        return mapToResponse(roadmap, principal.getId());
    }

    @Transactional(readOnly = true)
    public List<RoadmapResponse> getMyRoadmaps(UserPrincipal principal) {
        return roadmapRepository.findByUserIdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(roadmap -> mapToResponse(roadmap, principal.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public RoadmapResponse getRoadmap(UserPrincipal principal, Long roadmapId) {
        Roadmap roadmap = roadmapRepository.findByIdAndUserId(roadmapId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found with id: " + roadmapId));
        return mapToResponse(roadmap, principal.getId());
    }

    @Transactional
    public RoadmapResponse updateMilestoneStatus(
            UserPrincipal principal,
            Long roadmapId,
            Long milestoneId,
            UpdateMilestoneStatusRequest request) {

        Roadmap roadmap = roadmapRepository.findByIdAndUserId(roadmapId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found with id: " + roadmapId));

        RoadmapMilestone milestone = milestoneRepository.findByIdAndRoadmapId(milestoneId, roadmapId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + milestoneId));

        List<RoadmapMilestone> allMilestones = milestoneRepository.findByRoadmapIdOrderByMilestoneOrderAsc(roadmapId);
        if (request.getStatus() == MilestoneStatus.COMPLETED) {
            boolean earlierMilestoneIncomplete = allMilestones.stream()
                    .anyMatch(item -> item.getMilestoneOrder() < milestone.getMilestoneOrder()
                            && item.getStatus() != MilestoneStatus.COMPLETED);
            if (earlierMilestoneIncomplete) {
                throw new BadRequestException("Complete earlier roadmap milestones before completing this milestone.");
            }
            validateSkillMilestoneCompletion(principal.getId(), milestone);
        }

        milestone.setStatus(request.getStatus());
        if (request.getStatus() == MilestoneStatus.COMPLETED) {
            milestone.setCompletedAt(Instant.now());
        } else {
            milestone.setCompletedAt(null);
        }
        milestoneRepository.save(milestone);

        // Recalculate completed milestones
        allMilestones = milestoneRepository.findByRoadmapIdOrderByMilestoneOrderAsc(roadmapId);
        roadmap.setMilestones(allMilestones);
        long completedCount = allMilestones.stream()
                .filter(m -> m.getStatus() == MilestoneStatus.COMPLETED)
                .count();

        roadmap.setCompletedMilestones((int) completedCount);
        if (completedCount >= allMilestones.size() && !allMilestones.isEmpty()) {
            roadmap.setStatus(RoadmapStatus.COMPLETED);
        } else {
            roadmap.setStatus(RoadmapStatus.ACTIVE);
        }
        roadmap = roadmapRepository.save(roadmap);

        return mapToResponse(roadmap, principal.getId());
    }

    @Transactional
    public void deleteRoadmap(UserPrincipal principal, Long roadmapId) {
        Roadmap roadmap = roadmapRepository.findByIdAndUserId(roadmapId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found with id: " + roadmapId));
        roadmapRepository.delete(roadmap);
    }

    private RoadmapResponse mapToResponse(Roadmap roadmap, Long userId) {
        List<SavedResource> savedResources = savedResourceRepository.findByUserIdOrderBySavedAtDesc(userId);
        Set<Long> passedAssessmentIds = assessmentAttemptRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(attempt -> attempt.getStatus() == AssessmentAttempt.AttemptStatus.SCORED
                        && Boolean.TRUE.equals(attempt.getPassed()))
                .map(AssessmentAttempt::getAssessmentId)
                .collect(Collectors.toSet());
        List<MilestoneResponse> milestoneResponses = roadmap.getMilestones() != null
                ? roadmap.getMilestones().stream()
                        .map(milestone -> mapMilestoneToResponse(milestone, savedResources, passedAssessmentIds))
                        .toList()
                : List.of();

        double completionPercentage = (roadmap.getTotalMilestones() != null && roadmap.getTotalMilestones() > 0)
                ? ((double) roadmap.getCompletedMilestones() / roadmap.getTotalMilestones()) * 100.0
                : 0.0;

        return RoadmapResponse.builder()
                .id(roadmap.getId())
                .userId(roadmap.getUserId())
                .careerRoleId(roadmap.getTargetCareerRole().getId())
                .careerRoleTitle(roadmap.getTargetCareerRole().getTitle())
                .title(roadmap.getTitle())
                .description(roadmap.getDescription())
                .totalMilestones(roadmap.getTotalMilestones())
                .completedMilestones(roadmap.getCompletedMilestones())
                .completionPercentage(Math.round(completionPercentage * 10.0) / 10.0)
                .status(roadmap.getStatus())
                .milestones(milestoneResponses)
                .createdAt(roadmap.getCreatedAt())
                .updatedAt(roadmap.getUpdatedAt())
                .build();
    }

    private MilestoneResponse mapMilestoneToResponse(RoadmapMilestone m, List<SavedResource> savedResources,
                                                      Set<Long> passedAssessmentIds) {
        List<RoadmapResourceResponse> resources = m.getTargetSkill() == null
                ? List.of()
                : learningResourceRepository.findBySkillId(m.getTargetSkill().getId()).stream()
                        .map(resource -> mapResource(resource, savedResources))
                        .toList();
        List<RoadmapAssessmentResponse> assessments = m.getTargetSkill() == null
                ? List.of()
                : assessmentRepository.findBySkillIdAndActiveTrue(m.getTargetSkill().getId()).stream()
                        .map(assessment -> RoadmapAssessmentResponse.builder()
                                .id(assessment.getId())
                                .title(assessment.getTitle())
                                .passingScore(assessment.getPassingScore())
                                .passed(passedAssessmentIds.contains(assessment.getId()))
                                .build())
                        .toList();
        long completedResources = resources.stream().filter(RoadmapResourceResponse::isCompleted).count();
        boolean assessmentPassed = assessments.stream().anyMatch(RoadmapAssessmentResponse::isPassed);
        List<String> blockers = completionBlockers(resources.size(), (int) completedResources,
                assessments.size(), assessmentPassed, m.getTargetSkill() != null);
        return MilestoneResponse.builder()
                .id(m.getId())
                .milestoneOrder(m.getMilestoneOrder())
                .title(m.getTitle())
                .description(m.getDescription())
                .targetSkillId(m.getTargetSkill() != null ? m.getTargetSkill().getId() : null)
                .targetSkillName(m.getTargetSkill() != null ? m.getTargetSkill().getName() : null)
                .targetProficiency(m.getTargetProficiency())
                .status(m.getStatus())
                .estimatedWeeks(m.getEstimatedWeeks())
                .completedAt(m.getCompletedAt())
                .createdAt(m.getCreatedAt())
                .learningResources(resources)
                .assessments(assessments)
                .completedResourceCount((int) completedResources)
                .requiredResourceCount(resources.size())
                .assessmentPassed(assessmentPassed)
                .completionReady(blockers.isEmpty())
                .completionBlockers(blockers)
                .build();
    }

    private RoadmapResourceResponse mapResource(LearningResource resource, List<SavedResource> savedResources) {
        SavedResource saved = savedResources.stream()
                .filter(item -> item.getResource().getId().equals(resource.getId()))
                .findFirst()
                .orElse(null);
        return RoadmapResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .url(resource.getUrl())
                .progressPercent(saved != null ? saved.getProgressPercent() : 0)
                .completed(saved != null && Boolean.TRUE.equals(saved.getIsCompleted()))
                .build();
    }

    private void validateSkillMilestoneCompletion(Long userId, RoadmapMilestone milestone) {
        if (milestone.getTargetSkill() == null) return;
        Long skillId = milestone.getTargetSkill().getId();
        List<LearningResource> resources = learningResourceRepository.findBySkillId(skillId);
        if (resources.isEmpty()) {
            throw new BadRequestException("No learning resources are assigned to "
                    + milestone.getTargetSkill().getName() + "; the milestone cannot be completed yet.");
        }
        List<SavedResource> completedResources = savedResourceRepository.findByUserIdOrderBySavedAtDesc(userId);
        boolean hasIncompleteResource = resources.stream().anyMatch(resource -> completedResources.stream()
                .noneMatch(saved -> saved.getResource().getId().equals(resource.getId())
                        && Boolean.TRUE.equals(saved.getIsCompleted())));
        if (hasIncompleteResource) {
            throw new BadRequestException("Complete every learning resource provided for "
                    + milestone.getTargetSkill().getName() + " before completing this milestone.");
        }

        List<Assessment> assessments = assessmentRepository.findBySkillIdAndActiveTrue(skillId);
        if (assessments.isEmpty()) {
            throw new BadRequestException("No active assessment is available for "
                    + milestone.getTargetSkill().getName() + "; the milestone cannot be completed yet.");
        }
        Set<Long> assessmentIds = assessments.stream().map(Assessment::getId).collect(Collectors.toSet());
        boolean passed = assessmentAttemptRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .anyMatch(attempt -> assessmentIds.contains(attempt.getAssessmentId())
                        && attempt.getStatus() == AssessmentAttempt.AttemptStatus.SCORED
                        && Boolean.TRUE.equals(attempt.getPassed()));
        if (!passed) {
            throw new BadRequestException("Pass an active " + milestone.getTargetSkill().getName()
                    + " assessment before completing this milestone.");
        }
    }

    private List<String> completionBlockers(int resourceCount, int completedResourceCount,
                                            int assessmentCount, boolean assessmentPassed, boolean skillMilestone) {
        if (!skillMilestone) return List.of();
        List<String> blockers = new ArrayList<>();
        if (resourceCount == 0) {
            blockers.add("No learning resources are assigned to this skill yet.");
        } else if (completedResourceCount < resourceCount) {
            blockers.add("Complete all " + resourceCount + " provided learning resources.");
        }
        if (assessmentCount == 0) {
            blockers.add("No active skill assessment is available yet.");
        } else if (!assessmentPassed) {
            blockers.add("Pass at least one active skill assessment.");
        }
        return blockers;
    }
}
