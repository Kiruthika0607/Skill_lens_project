package com.skilllens.analytics;

import com.skilllens.assessment.AssessmentAttempt;
import com.skilllens.assessment.AssessmentAttemptRepository;
import com.skilllens.assessment.AssessmentRepository;
import com.skilllens.career.CareerRecommendationRepository;
import com.skilllens.career.CareerRequiredSkill;
import com.skilllens.career.CareerRequiredSkillRepository;
import com.skilllens.career.CareerRole;
import com.skilllens.career.CareerRoleRepository;
import com.skilllens.opportunity.ApplicationStatus;
import com.skilllens.opportunity.OpportunityRepository;
import com.skilllens.opportunity.SavedOpportunityRepository;
import com.skilllens.roadmap.Roadmap;
import com.skilllens.roadmap.RoadmapRepository;
import com.skilllens.roadmap.RoadmapStatus;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import com.skilllens.student.StudentProfile;
import com.skilllens.student.StudentProfileRepository;
import com.skilllens.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private SkillRepository skillRepository;
    @Mock private StudentSkillRepository studentSkillRepository;
    @Mock private AssessmentRepository assessmentRepository;
    @Mock private AssessmentAttemptRepository attemptRepository;
    @Mock private RoadmapRepository roadmapRepository;
    @Mock private OpportunityRepository opportunityRepository;
    @Mock private SavedOpportunityRepository savedOpportunityRepository;
    @Mock private StudentProfileRepository profileRepository;
    @Mock private CareerRecommendationRepository careerRecommendationRepository;
    @Mock private CareerRoleRepository careerRoleRepository;
    @Mock private CareerRequiredSkillRepository careerRequiredSkillRepository;

    @InjectMocks private AnalyticsService analyticsService;

    @Test
    void getStudentAnalyticsCalculatesPerformanceAgainstPreferredCareer() {
        UserPrincipal principal = UserPrincipal.builder().id(1L).email("student@test.com").build();
        Skill java = Skill.builder().id(11L).name("Java").build();
        Skill react = Skill.builder().id(12L).name("React").build();
        CareerRole target = CareerRole.builder().id(20L).title("Full Stack Engineer").build();

        when(studentSkillRepository.findByUserId(1L)).thenReturn(List.of(
                StudentSkill.builder().userId(1L).skill(java).assessedProficiency(2).build(),
                StudentSkill.builder().userId(1L).skill(react).selfReportedProficiency(2).build()));
        when(attemptRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(
                AssessmentAttempt.builder().status(AssessmentAttempt.AttemptStatus.SCORED).passed(true).build(),
                AssessmentAttempt.builder().status(AssessmentAttempt.AttemptStatus.SCORED).passed(false).build(),
                AssessmentAttempt.builder().status(AssessmentAttempt.AttemptStatus.IN_PROGRESS).build()));
        when(roadmapRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(
                Roadmap.builder().status(RoadmapStatus.ACTIVE).completedMilestones(2).totalMilestones(4).build()));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(
                StudentProfile.builder().userId(1L).preferredCareerRole(target.getTitle()).build()));
        when(careerRecommendationRepository.findByUserIdOrderByMatchScoreDesc(1L)).thenReturn(List.of());
        when(careerRoleRepository.findByTitleIgnoreCase(target.getTitle())).thenReturn(Optional.of(target));
        when(careerRequiredSkillRepository.findByCareerId(20L)).thenReturn(List.of(
                CareerRequiredSkill.builder().skillId(11L).minProficiency(4).weight(1.0).build(),
                CareerRequiredSkill.builder().skillId(12L).minProficiency(4).weight(1.0).build()));
        when(savedOpportunityRepository.countByUserIdAndStatus(1L, ApplicationStatus.SAVED)).thenReturn(0L);
        when(savedOpportunityRepository.countByUserIdAndStatus(1L, ApplicationStatus.APPLIED)).thenReturn(0L);

        StudentAnalyticsResponse result = analyticsService.getStudentAnalytics(principal);

        assertEquals(50.0, result.getCareerReadinessScore());
        assertEquals("Full Stack Engineer", result.getTargetCareerTitle());
        assertEquals(50.0, result.getAssessmentPassRate());
        assertEquals(2, result.getAssessmentsAttempted());
        assertEquals(1, result.getAssessmentsPassed());
        assertEquals(50.0, result.getRoadmapProgressPercentage());
        assertEquals(2, result.getTotalSkillsTracked());
        assertEquals(1, result.getVerifiedSkillsCount());
        assertEquals(2, result.getCriticalSkillGaps().size());
        assertEquals("Java", result.getCriticalSkillGaps().get(0).getSkillName());
    }
}
