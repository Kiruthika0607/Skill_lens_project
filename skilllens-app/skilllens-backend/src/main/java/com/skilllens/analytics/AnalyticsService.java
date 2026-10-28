package com.skilllens.analytics;

import com.skilllens.assessment.AssessmentAttempt;
import com.skilllens.assessment.AssessmentAttemptRepository;
import com.skilllens.assessment.AssessmentRepository;
import com.skilllens.career.CareerRecommendation;
import com.skilllens.career.CareerRecommendationRepository;
import com.skilllens.career.CareerRequiredSkill;
import com.skilllens.career.CareerRequiredSkillRepository;
import com.skilllens.career.CareerRole;
import com.skilllens.career.CareerRoleRepository;
import com.skilllens.opportunity.ApplicationStatus;
import com.skilllens.opportunity.Opportunity;
import com.skilllens.opportunity.OpportunityRepository;
import com.skilllens.opportunity.SavedOpportunityRepository;
import com.skilllens.roadmap.Roadmap;
import com.skilllens.roadmap.RoadmapRepository;
import com.skilllens.roadmap.RoadmapStatus;
import com.skilllens.security.UserPrincipal;
import com.skilllens.student.StudentProfile;
import com.skilllens.student.StudentProfileRepository;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import com.skilllens.user.Role;
import com.skilllens.user.User;
import com.skilllens.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final RoadmapRepository roadmapRepository;
    private final OpportunityRepository opportunityRepository;
    private final SavedOpportunityRepository savedOpportunityRepository;
    private final StudentProfileRepository profileRepository;
    private final CareerRecommendationRepository careerRecommendationRepository;
    private final CareerRoleRepository careerRoleRepository;
    private final CareerRequiredSkillRepository careerRequiredSkillRepository;

    @Transactional(readOnly = true)
    public StudentAnalyticsResponse getStudentAnalytics(UserPrincipal principal) {
        Long userId = principal.getId();

        List<StudentSkill> skills = studentSkillRepository.findByUserId(userId);
        long assessedSkillsCount = skills.stream().filter(s -> s.getAssessedProficiency() != null).count();

        double avgProficiency = skills.stream()
                .filter(s -> s.getAssessedProficiency() != null || s.getSelfReportedProficiency() != null)
                .mapToInt(s -> s.getAssessedProficiency() != null
                        ? s.getAssessedProficiency() : s.getSelfReportedProficiency())
                .average()
                .orElse(0.0);

        Map<String, Integer> dist = new HashMap<>();
        for (int i = 1; i <= 4; i++) dist.put("Level " + i, 0);
        for (StudentSkill s : skills) {
            Integer level = s.getAssessedProficiency() != null
                    ? s.getAssessedProficiency() : s.getSelfReportedProficiency();
            if (level != null && level >= 1 && level <= 4) {
                String key = "Level " + level;
                dist.put(key, dist.get(key) + 1);
            }
        }

        long verifiedSkills = skills.stream()
                .filter(s -> s.getAssessedProficiency() != null && s.getAssessedProficiency() > 0).count();
        long expertSkills = skills.stream().filter(s -> effectiveLevel(s) >= 4).count();
        long advancedSkills = skills.stream().filter(s -> effectiveLevel(s) == 3).count();
        long intermediateSkills = skills.stream().filter(s -> effectiveLevel(s) == 2).count();
        long beginnerSkills = skills.stream().filter(s -> effectiveLevel(s) == 1).count();

        Map<String, Long> categoryMap = skills.stream()
                .collect(Collectors.groupingBy(
                        s -> (s.getSkill().getCategory() != null ? s.getSkill().getCategory().getName() : "General"),
                        Collectors.counting()));

        List<AssessmentAttempt> attempts = attemptRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Roadmap> roadmaps = roadmapRepository.findByUserIdOrderByCreatedAtDesc(userId);

        long completedRoadmaps = roadmaps.stream().filter(r -> r.getStatus() == RoadmapStatus.COMPLETED).count();
        long activeRoadmaps = roadmaps.stream().filter(r -> r.getStatus() == RoadmapStatus.ACTIVE).count();
        long completedMilestones = roadmaps.stream().mapToLong(Roadmap::getCompletedMilestones).sum();
        long totalMilestones = roadmaps.stream().mapToLong(Roadmap::getTotalMilestones).sum();
        double roadmapProgress = totalMilestones == 0 ? 0.0
                : completedMilestones * 100.0 / totalMilestones;

        List<AssessmentAttempt> scoredAttempts = attempts.stream()
                .filter(a -> a.getStatus() == AssessmentAttempt.AttemptStatus.SCORED && a.getPassed() != null)
                .toList();
        long passedAttempts = scoredAttempts.stream().filter(a -> Boolean.TRUE.equals(a.getPassed())).count();
        double assessmentPassRate = scoredAttempts.isEmpty() ? 0.0
                : passedAttempts * 100.0 / scoredAttempts.size();

        StudentProfile profile = profileRepository.findByUserId(userId).orElse(null);
        List<CareerRecommendation> recommendations =
                careerRecommendationRepository.findByUserIdOrderByMatchScoreDesc(userId);
        CareerRole targetRole = resolveTargetRole(profile, recommendations);
        List<StudentAnalyticsResponse.CriticalSkillGap> criticalGaps = new ArrayList<>();
        double careerReadiness = 0.0;
        if (targetRole != null) {
            double weightedReadiness = 0.0;
            double totalWeight = 0.0;
            for (CareerRequiredSkill required : careerRequiredSkillRepository.findByCareerId(targetRole.getId())) {
                double weight = required.getWeight();
                if (weight <= 0 || required.getMinProficiency() <= 0) continue;
                int current = skills.stream()
                        .filter(s -> s.getSkill().getId().equals(required.getSkillId()))
                        .mapToInt(AnalyticsService::effectiveLevel)
                        .findFirst().orElse(0);
                int requiredLevel = required.getMinProficiency();
                weightedReadiness += weight * Math.min(current, requiredLevel) / requiredLevel;
                totalWeight += weight;
                if (current < requiredLevel) {
                    String skillName = skills.stream()
                            .filter(s -> s.getSkill().getId().equals(required.getSkillId()))
                            .map(s -> s.getSkill().getName())
                            .findFirst()
                            .orElseGet(() -> skillRepository.findById(required.getSkillId())
                                    .map(skill -> skill.getName()).orElse("Required skill"));
                    criticalGaps.add(StudentAnalyticsResponse.CriticalSkillGap.builder()
                            .skillName(skillName)
                            .currentLevel(current)
                            .requiredLevel(requiredLevel)
                            .gapPercentage(Math.round((requiredLevel - current) * 1000.0 / requiredLevel) / 10.0)
                            .build());
                }
            }
            if (totalWeight > 0) careerReadiness = weightedReadiness * 100.0 / totalWeight;
        }
        criticalGaps.sort(Comparator.comparingDouble(StudentAnalyticsResponse.CriticalSkillGap::getGapPercentage)
                .reversed());

        long savedOpps = savedOpportunityRepository.countByUserIdAndStatus(userId, ApplicationStatus.SAVED);
        long appliedOpps = savedOpportunityRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED);

        return StudentAnalyticsResponse.builder()
                .userId(userId)
                .assessedSkillsCount(assessedSkillsCount)
                .totalSkillsTracked(skills.size())
                .averageProficiency(Math.round(avgProficiency * 10.0) / 10.0)
                .assessmentsTakenCount(scoredAttempts.size())
                .completedRoadmapsCount(completedRoadmaps)
                .activeRoadmapsCount(activeRoadmaps)
                .savedOpportunitiesCount(savedOpps)
                .appliedOpportunitiesCount(appliedOpps)
                .proficiencyDistribution(dist)
                .skillsByCategory(categoryMap)
                .careerReadinessScore(Math.round(careerReadiness * 10.0) / 10.0)
                .targetCareerTitle(targetRole != null ? targetRole.getTitle() : null)
                .roadmapProgressPercentage(Math.round(roadmapProgress * 10.0) / 10.0)
                .completedMilestones(completedMilestones)
                .totalMilestones(totalMilestones)
                .assessmentPassRate(Math.round(assessmentPassRate * 10.0) / 10.0)
                .assessmentsAttempted(scoredAttempts.size())
                .assessmentsPassed(passedAttempts)
                .verifiedSkillsCount(verifiedSkills)
                .expertSkillsCount(expertSkills)
                .advancedSkillsCount(advancedSkills)
                .intermediateSkillsCount(intermediateSkills)
                .beginnerSkillsCount(beginnerSkills)
                .criticalSkillGaps(criticalGaps.stream().limit(8).toList())
                .build();
    }

    private CareerRole resolveTargetRole(StudentProfile profile, List<CareerRecommendation> recommendations) {
        if (profile != null && profile.getPreferredCareerRole() != null) {
            Optional<CareerRole> preferred = careerRoleRepository
                    .findByTitleIgnoreCase(profile.getPreferredCareerRole());
            if (preferred.isPresent()) return preferred.get();
        }
        if (!recommendations.isEmpty()) {
            Optional<CareerRole> recommended = careerRoleRepository.findById(recommendations.get(0).getCareerId());
            if (recommended.isPresent()) return recommended.get();
        }
        return careerRoleRepository.findByActiveTrue(org.springframework.data.domain.PageRequest.of(0, 1))
                .getContent().stream().findFirst().orElse(null);
    }

    private static int effectiveLevel(StudentSkill skill) {
        if (skill.getAssessedProficiency() != null) return skill.getAssessedProficiency();
        return skill.getSelfReportedProficiency() != null ? skill.getSelfReportedProficiency() : 0;
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getPlatformAnalytics() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long totalStudents = users.stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long totalAdmins = users.stream().filter(u -> u.getRole() == Role.ADMIN).count();

        long totalSkills = skillRepository.count();
        long totalAssessments = assessmentRepository.count();
        List<AssessmentAttempt> allAttempts = attemptRepository.findAll();
        long totalAttempts = allAttempts.size();

        double avgScore = allAttempts.stream()
                .filter(a -> a.getScore() != null && a.getMaxScore() != null && a.getMaxScore() > 0)
                .mapToDouble(a -> ((double) a.getScore() / a.getMaxScore()) * 100.0)
                .average()
                .orElse(0.0);

        long totalRoadmaps = roadmapRepository.count();
        List<Opportunity> opps = opportunityRepository.findAll();

        Map<String, Long> oppsByType = opps.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getOpportunityType().name(),
                        Collectors.counting()));

        Map<String, Long> usersByStatus = users.stream()
                .collect(Collectors.groupingBy(
                        u -> (u.isEnabled() ? "ACTIVE" : "INACTIVE"),
                        Collectors.counting()));

        return AdminAnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalStudents(totalStudents)
                .totalAdmins(totalAdmins)
                .totalSkills(totalSkills)
                .totalAssessments(totalAssessments)
                .totalAttemptsTaken(totalAttempts)
                .averageAssessmentScore(Math.round(avgScore * 10.0) / 10.0)
                .totalRoadmaps(totalRoadmaps)
                .totalOpportunities(opps.size())
                .opportunitiesByType(oppsByType)
                .usersByStatus(usersByStatus)
                .build();
    }
}
