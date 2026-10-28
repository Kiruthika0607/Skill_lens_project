package com.skilllens.student;

import com.skilllens.assessment.AssessmentAttempt;
import com.skilllens.assessment.AssessmentAttemptRepository;
import com.skilllens.assessment.AssessmentRepository;
import com.skilllens.assessment.AttemptResultResponse;
import com.skilllens.career.*;
import com.skilllens.opportunity.*;
import com.skilllens.resource.LearningResourceRepository;
import com.skilllens.resource.ResourceResponse;
import com.skilllens.resource.ResourceService;
import com.skilllens.resume.ResumeRepository;
import com.skilllens.roadmap.MilestoneStatus;
import com.skilllens.roadmap.Roadmap;
import com.skilllens.roadmap.RoadmapMilestone;
import com.skilllens.roadmap.RoadmapRepository;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentDashboardService {

    private final StudentProfileRepository profileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final CareerRecommendationRepository careerRecommendationRepository;
    private final CareerRoleRepository careerRoleRepository;
    private final CareerRequiredSkillRepository requiredSkillRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentRepository assessmentRepository;
    private final RoadmapRepository roadmapRepository;
    private final LearningResourceRepository resourceRepository;
    private final OpportunityRepository opportunityRepository;
    private final OpportunityService opportunityService;
    private final ResourceService resourceService;
    private final ResumeRepository resumeRepository;
    private final com.skilllens.skill.SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public StudentDashboardResponse getDashboard(UserPrincipal principal) {
        Long userId = principal.getId();

        // 1. Student Profile & Resume status
        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(userId);
        StudentProfile profile = profileOpt.orElse(null);
        int completion = calculateProfileCompletion(profile);
        boolean hasResume = resumeRepository.countByUserId(userId) > 0;

        // 2. Assessed and Total skills
        List<StudentSkill> studentSkills = studentSkillRepository.findByUserId(userId);
        long assessedSkillCount = studentSkillRepository.countAssessedSkills(userId);
        int totalSkills = studentSkills.size();
        int verifiedSkills = (int) studentSkills.stream()
                .filter(s -> s.getAssessedProficiency() != null && s.getAssessedProficiency() > 0)
                .count();
        int expertCount = (int) studentSkills.stream()
                .filter(s -> (s.getAssessedProficiency() != null && s.getAssessedProficiency() >= 4)
                        || (s.getSelfReportedProficiency() != null && s.getSelfReportedProficiency() >= 4))
                .count();
        int advancedCount = (int) studentSkills.stream()
                .filter(s -> (s.getAssessedProficiency() != null && s.getAssessedProficiency() == 3)
                        || (s.getSelfReportedProficiency() != null && s.getSelfReportedProficiency() == 3))
                .count();

        // 3. Career Recommendations & Target Role
        List<CareerRecommendation> recs = careerRecommendationRepository.findByUserIdOrderByMatchScoreDesc(userId);
        long careerRecCount = recs.size();

        StudentDashboardResponse.TargetCareerDto targetCareer = null;
        StudentDashboardResponse.SkillGapSummaryDto skillGapSummary = null;

        Long careerRoleId = null;
        String careerRoleTitle = "Full Stack Software Engineer";
        Double matchScore = 0.0;
        int matchedSkillsCount = 0;
        int totalRequiredSkills = 0;

        if (!recs.isEmpty()) {
            CareerRecommendation topRec = recs.get(0);
            careerRoleId = topRec.getCareerId();
            matchScore = topRec.getMatchScore();
            matchedSkillsCount = topRec.getMatchedSkillCount();
            totalRequiredSkills = topRec.getTotalRequiredSkills();
            Optional<CareerRole> crOpt = careerRoleRepository.findById(careerRoleId);
            if (crOpt.isPresent()) {
                careerRoleTitle = crOpt.get().getTitle();
            }
        } else if (profile != null && profile.getPreferredCareerRole() != null && !profile.getPreferredCareerRole().isBlank()) {
            careerRoleTitle = profile.getPreferredCareerRole();
            Optional<CareerRole> crOpt = careerRoleRepository.findByTitleIgnoreCase(careerRoleTitle);
            if (crOpt.isPresent()) {
                careerRoleId = crOpt.get().getId();
            }
        } else {
            List<CareerRole> activeRoles = careerRoleRepository.findByActiveTrue(PageRequest.of(0, 1)).getContent();
            if (!activeRoles.isEmpty()) {
                CareerRole defaultRole = activeRoles.get(0);
                careerRoleId = defaultRole.getId();
                careerRoleTitle = defaultRole.getTitle();
            }
        }

        if (careerRoleId != null) {
            List<CareerRequiredSkill> requirements = requiredSkillRepository.findByCareerId(careerRoleId);
            totalRequiredSkills = requirements.size();

            Map<Long, Integer> studentSkillProfMap = new HashMap<>();
            for (StudentSkill ss : studentSkills) {
                int eff = ss.getAssessedProficiency() != null ? ss.getAssessedProficiency() :
                        (ss.getSelfReportedProficiency() != null ? ss.getSelfReportedProficiency() : 0);
                studentSkillProfMap.put(ss.getSkill().getId(), eff);
            }

            matchedSkillsCount = 0;
            int gapCount = 0;
            List<StudentDashboardResponse.CriticalGapSkillDto> criticalGaps = new ArrayList<>();

            for (CareerRequiredSkill req : requirements) {
                int currentProf = studentSkillProfMap.getOrDefault(req.getSkillId(), 0);
                if (currentProf >= req.getMinProficiency()) {
                    matchedSkillsCount++;
                } else {
                    gapCount++;
                    double gapPct = req.getMinProficiency() > 0 ?
                            ((double) (req.getMinProficiency() - currentProf) / req.getMinProficiency()) * 100.0 : 0.0;
                    String skillName = skillRepository.findById(req.getSkillId())
                            .map(com.skilllens.skill.Skill::getName)
                            .orElse("Required Skill");
                    criticalGaps.add(StudentDashboardResponse.CriticalGapSkillDto.builder()
                            .skillName(skillName)
                            .currentLevel(currentProf)
                            .requiredLevel(req.getMinProficiency())
                            .gapPercentage(Math.round(gapPct * 10.0) / 10.0)
                            .build());
                }
            }

            if (matchScore == 0.0 && totalRequiredSkills > 0) {
                matchScore = Math.round(((double) matchedSkillsCount / totalRequiredSkills) * 1000.0) / 10.0;
            }

            targetCareer = StudentDashboardResponse.TargetCareerDto.builder()
                    .id(careerRoleId)
                    .title(careerRoleTitle)
                    .matchPercentage(matchScore)
                    .matchedSkillsCount(matchedSkillsCount)
                    .totalSkillsCount(totalRequiredSkills)
                    .build();

            skillGapSummary = StudentDashboardResponse.SkillGapSummaryDto.builder()
                    .targetCareerTitle(careerRoleTitle)
                    .overallReadinessScore(matchScore)
                    .totalGapCount(gapCount)
                    .criticalGapSkills(criticalGaps.stream().limit(5).toList())
                    .build();
        }

        // 4. Roadmap milestones
        List<Roadmap> roadmaps = roadmapRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long activeMilestones = 0;
        long completedMilestones = 0;
        String nextMilestoneTitle = null;

        for (Roadmap r : roadmaps) {
            if (r.getMilestones() != null) {
                for (RoadmapMilestone m : r.getMilestones()) {
                    if (m.getStatus() == MilestoneStatus.COMPLETED) {
                        completedMilestones++;
                    } else if (m.getStatus() == MilestoneStatus.IN_PROGRESS || m.getStatus() == MilestoneStatus.NOT_STARTED) {
                        activeMilestones++;
                        if (nextMilestoneTitle == null) {
                            nextMilestoneTitle = m.getTitle();
                        }
                    }
                }
            }
        }

        int totalM = (int) (activeMilestones + completedMilestones);
        int roadmapProgress = totalM > 0 ? (int) Math.round(((double) completedMilestones / totalM) * 100.0) : 0;

        StudentDashboardResponse.ActiveRoadmapDto activeRoadmap = StudentDashboardResponse.ActiveRoadmapDto.builder()
                .id(roadmaps.isEmpty() ? null : roadmaps.get(0).getId())
                .title(roadmaps.isEmpty() ? "Engineering Career Roadmap" : roadmaps.get(0).getTitle())
                .progressPercentage(roadmapProgress)
                .nextMilestoneTitle(nextMilestoneTitle != null ? nextMilestoneTitle : "Technical Fundamentals")
                .build();

        // 5. Recent assessment attempts
        List<AssessmentAttempt> attempts = attemptRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 5)).getContent();

        List<AttemptResultResponse> recentResults = attempts.stream().map(a -> {
            String title = assessmentRepository.findById(a.getAssessmentId())
                    .map(com.skilllens.assessment.Assessment::getTitle)
                    .orElse("Skill Assessment");

            return AttemptResultResponse.builder()
                    .id(a.getId())
                    .assessmentId(a.getAssessmentId())
                    .assessmentTitle(title)
                    .status(a.getStatus().name())
                    .score(a.getScore())
                    .maxScore(a.getMaxScore())
                    .passed(a.getPassed())
                    .assessedProficiency(a.getAssessedProficiency())
                    .submittedAt(a.getSubmittedAt())
                    .build();
        }).toList();

        List<StudentDashboardResponse.DashboardAssessmentDto> dashboardAssessments = attempts.stream().map(a -> {
            String title = assessmentRepository.findById(a.getAssessmentId())
                    .map(com.skilllens.assessment.Assessment::getTitle)
                    .orElse("Skill Assessment");
            return StudentDashboardResponse.DashboardAssessmentDto.builder()
                    .id(a.getId())
                    .title(title)
                    .score(a.getScore())
                    .maxScore(a.getMaxScore())
                    .passed(a.getPassed())
                    .assessedProficiency(a.getAssessedProficiency())
                    .submittedAt(a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : null)
                    .build();
        }).toList();

        // 6. Recommended learning resources (personalized to student skills)
        List<ResourceResponse> recommendedResources = new ArrayList<>();
        List<Long> targetSkillIds = studentSkills.stream()
                .filter(s -> s.getAssessedProficiency() == null || s.getAssessedProficiency() < 3)
                .map(s -> s.getSkill().getId())
                .limit(4)
                .toList();

        for (Long sId : targetSkillIds) {
            recommendedResources.addAll(resourceService.getResourcesBySkill(sId));
            if (recommendedResources.size() >= 5) break;
        }

        if (recommendedResources.isEmpty()) {
            recommendedResources = resourceRepository.findAll(PageRequest.of(0, 5))
                    .map(r -> resourceService.getResource(r.getId()))
                    .getContent();
        }

        // 7. Recommended opportunities (personalized to resume skills)
        List<OpportunityMatchResponse> recommendedOpportunities =
                opportunityService.getMatchedOpportunities(principal, 5);

        // 8. Upcoming deadlines
        List<StudentDashboardResponse.DashboardDeadlineDto> upcomingDeadlines = opportunityRepository.findByIsActiveTrue()
                .stream()
                .filter(o -> o.getDeadline() != null)
                .sorted(Comparator.comparing(Opportunity::getDeadline))
                .limit(5)
                .map(o -> StudentDashboardResponse.DashboardDeadlineDto.builder()
                        .id(o.getId())
                        .title(o.getTitle())
                        .organization(o.getOrganization())
                        .type(o.getOpportunityType() != null ? o.getOpportunityType().name() : "OPPORTUNITY")
                        .deadline(o.getDeadline() != null ? o.getDeadline().toString() : null)
                        .build())
                .toList();

        // Build composite profile DTO
        StudentDashboardResponse.DashboardProfileDto dashboardProfile = StudentDashboardResponse.DashboardProfileDto.builder()
                .firstName(profile != null && profile.getFirstName() != null ? profile.getFirstName() : "Student")
                .lastName(profile != null ? profile.getLastName() : "")
                .university(profile != null && profile.getInstitution() != null ? profile.getInstitution() : "")
                .major(profile != null && profile.getDepartment() != null ? profile.getDepartment() : (profile != null && profile.getDegree() != null ? profile.getDegree() : ""))
                .profileCompletionPercentage(completion)
                .hasResume(hasResume)
                .build();

        return StudentDashboardResponse.builder()
                // Legacy fields
                .profileCompletion(completion)
                .assessedSkillCount(assessedSkillCount)
                .careerRecommendationCount(careerRecCount)
                .activeRoadmapMilestones(activeMilestones)
                .completedRoadmapMilestones(completedMilestones)
                .recentAssessmentResults(recentResults)
                .recommendedResources(recommendedResources.stream().limit(5).toList())
                .recommendedOpportunities(recommendedOpportunities)
                // New Dashboard fields
                .profile(dashboardProfile)
                .targetCareer(targetCareer)
                .skillOverview(StudentDashboardResponse.SkillOverviewDto.builder()
                        .totalSkills(totalSkills)
                        .verifiedSkills(verifiedSkills)
                        .expertCount(expertCount)
                        .advancedCount(advancedCount)
                        .build())
                .skillGapSummary(skillGapSummary)
                .activeRoadmap(activeRoadmap)
                .recentAssessments(dashboardAssessments)
                .upcomingDeadlines(upcomingDeadlines)
                .build();
    }

    private int calculateProfileCompletion(StudentProfile p) {
        if (p == null) return 10;
        int score = 0;
        int total = 10;

        if (p.getFirstName() != null && !p.getFirstName().isBlank()) score++;
        if (p.getLastName() != null && !p.getLastName().isBlank()) score++;
        if (p.getPhone() != null && !p.getPhone().isBlank()) score++;
        if (p.getBio() != null && !p.getBio().isBlank()) score++;
        if (p.getInstitution() != null && !p.getInstitution().isBlank()) score++;
        if (p.getDegree() != null && !p.getDegree().isBlank()) score++;
        if (p.getDepartment() != null && !p.getDepartment().isBlank()) score++;
        if (p.getGraduationYear() != null) score++;
        if (p.getGpa() != null) score++;
        if (p.getPreferredCareerRole() != null && !p.getPreferredCareerRole().isBlank()) score++;

        return (int) Math.round(((double) score / total) * 100.0);
    }
}
