package com.skilllens.roadmap;

import com.skilllens.career.CareerRequiredSkill;
import com.skilllens.career.CareerRequiredSkillRepository;
import com.skilllens.career.CareerRole;
import com.skilllens.career.CareerRoleRepository;
import com.skilllens.security.UserPrincipal;
import com.skilllens.assessment.Assessment;
import com.skilllens.assessment.AssessmentAttempt;
import com.skilllens.assessment.AssessmentAttemptRepository;
import com.skilllens.assessment.AssessmentRepository;
import com.skilllens.common.exception.BadRequestException;
import com.skilllens.resource.LearningResource;
import com.skilllens.resource.LearningResourceRepository;
import com.skilllens.resource.SavedResource;
import com.skilllens.resource.SavedResourceRepository;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoadmapServiceTest {

    @Mock
    private RoadmapRepository roadmapRepository;

    @Mock
    private RoadmapMilestoneRepository milestoneRepository;

    @Mock
    private CareerRoleRepository careerRoleRepository;

    @Mock
    private CareerRequiredSkillRepository requiredSkillRepository;

    @Mock
    private StudentSkillRepository studentSkillRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private LearningResourceRepository learningResourceRepository;

    @Mock
    private SavedResourceRepository savedResourceRepository;

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private AssessmentAttemptRepository assessmentAttemptRepository;

    @InjectMocks
    private RoadmapService roadmapService;

    private UserPrincipal principal;
    private CareerRole careerRole;

    @BeforeEach
    void setUp() {
        principal = UserPrincipal.builder()
                .id(1L)
                .email("student@test.com")
                .password("pwd")
                .enabled(true)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
                .build();

        careerRole = CareerRole.builder()
                .id(10L)
                .title("Full Stack Engineer")
                .description("Builds end-to-end web apps")
                .active(true)
                .build();
    }

    @Test
    void generateRoadmap_ordersMilestonesBySkillGap_andAppendsCapstone() {
        GenerateRoadmapRequest request = new GenerateRoadmapRequest();
        request.setCareerRoleId(10L);

        when(careerRoleRepository.findById(10L)).thenReturn(Optional.of(careerRole));

        Skill skillA = Skill.builder().id(101L).name("Java").build();
        Skill skillB = Skill.builder().id(102L).name("React").build();

        CareerRequiredSkill reqA = CareerRequiredSkill.builder()
                .id(1L)
                .careerId(10L)
                .skillId(101L)
                .minProficiency(4)
                .weight(1.0)
                .build();

        CareerRequiredSkill reqB = CareerRequiredSkill.builder()
                .id(2L)
                .careerId(10L)
                .skillId(102L)
                .minProficiency(3)
                .weight(0.8)
                .build();

        when(requiredSkillRepository.findByCareerId(10L)).thenReturn(List.of(reqA, reqB));

        // Student has level 2 in Java (gap = 2), but not assessed in React (gap = 3)
        StudentSkill ss = StudentSkill.builder().userId(1L).skill(skillA).assessedProficiency(2).build();
        when(studentSkillRepository.findByUserId(1L)).thenReturn(List.of(ss));

        when(skillRepository.findById(101L)).thenReturn(Optional.of(skillA));
        when(skillRepository.findById(102L)).thenReturn(Optional.of(skillB));
        when(learningResourceRepository.findBySkillId(anyLong())).thenReturn(List.of());
        when(assessmentRepository.findBySkillIdAndActiveTrue(anyLong())).thenReturn(List.of());
        when(savedResourceRepository.findByUserIdOrderBySavedAtDesc(1L)).thenReturn(List.of());
        when(assessmentAttemptRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        when(roadmapRepository.save(any(Roadmap.class))).thenAnswer(inv -> {
            Roadmap r = inv.getArgument(0);
            if (r.getId() == null) r.setId(99L);
            return r;
        });

        RoadmapResponse response = roadmapService.generateRoadmap(principal, request);

        assertNotNull(response);
        assertEquals(99L, response.getId());
        assertEquals(RoadmapStatus.ACTIVE, response.getStatus());
        // 2 skills + 1 capstone = 3 milestones
        assertEquals(3, response.getTotalMilestones());

        verify(milestoneRepository).saveAll(argThat((List<RoadmapMilestone> list) -> {
            assertEquals(3, list.size());
            // React has gap 3, Java has gap 2 -> React should be first!
            assertEquals("Master React (Target Level: 3)", list.get(0).getTitle());
            assertEquals("Master Java (Target Level: 4)", list.get(1).getTitle());
            assertEquals("Complete Capstone Portfolio Project & Mock Interview", list.get(2).getTitle());
            return true;
        }));
    }

    @Test
    void updateMilestoneStatus_updatesCompletion_andMarksRoadmapCompletedWhenAllDone() {
        Roadmap roadmap = Roadmap.builder()
                .id(99L)
                .userId(1L)
                .targetCareerRole(careerRole)
                .status(RoadmapStatus.ACTIVE)
                .totalMilestones(2)
                .completedMilestones(1)
                .build();

        RoadmapMilestone m1 = RoadmapMilestone.builder()
                .id(501L)
                .roadmap(roadmap)
                .milestoneOrder(1)
                .status(MilestoneStatus.COMPLETED)
                .build();

        RoadmapMilestone m2 = RoadmapMilestone.builder()
                .id(502L)
                .roadmap(roadmap)
                .milestoneOrder(2)
                .status(MilestoneStatus.IN_PROGRESS)
                .build();

        List<RoadmapMilestone> milestones = new ArrayList<>(List.of(m1, m2));
        roadmap.setMilestones(milestones);

        when(roadmapRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.of(roadmap));
        when(milestoneRepository.findByIdAndRoadmapId(502L, 99L)).thenReturn(Optional.of(m2));
        when(milestoneRepository.findByRoadmapIdOrderByMilestoneOrderAsc(99L)).thenReturn(List.of(m1, m2));
        when(savedResourceRepository.findByUserIdOrderBySavedAtDesc(1L)).thenReturn(List.of());
        when(assessmentAttemptRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        when(roadmapRepository.save(any(Roadmap.class))).thenAnswer(i -> i.getArgument(0));

        UpdateMilestoneStatusRequest updateReq = new UpdateMilestoneStatusRequest();
        updateReq.setStatus(MilestoneStatus.COMPLETED);

        RoadmapResponse res = roadmapService.updateMilestoneStatus(principal, 99L, 502L, updateReq);

        assertNotNull(res);
        assertEquals(RoadmapStatus.COMPLETED, res.getStatus());
        assertEquals(2, res.getCompletedMilestones());
        assertEquals(100.0, res.getCompletionPercentage());
    }

    @Test
    void updateMilestoneStatus_rejectsCompletingMilestoneBeforeEarlierMilestone() {
        Roadmap roadmap = Roadmap.builder().id(99L).userId(1L).targetCareerRole(careerRole)
                .status(RoadmapStatus.ACTIVE).totalMilestones(2).completedMilestones(0).build();
        RoadmapMilestone earlier = RoadmapMilestone.builder().id(501L).roadmap(roadmap)
                .milestoneOrder(1).status(MilestoneStatus.IN_PROGRESS).build();
        RoadmapMilestone later = RoadmapMilestone.builder().id(502L).roadmap(roadmap)
                .milestoneOrder(2).status(MilestoneStatus.NOT_STARTED).build();

        when(roadmapRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.of(roadmap));
        when(milestoneRepository.findByIdAndRoadmapId(502L, 99L)).thenReturn(Optional.of(later));
        when(milestoneRepository.findByRoadmapIdOrderByMilestoneOrderAsc(99L)).thenReturn(List.of(earlier, later));

        UpdateMilestoneStatusRequest request = new UpdateMilestoneStatusRequest();
        request.setStatus(MilestoneStatus.COMPLETED);

        assertThrows(BadRequestException.class,
                () -> roadmapService.updateMilestoneStatus(principal, 99L, 502L, request));
        verifyNoInteractions(learningResourceRepository, assessmentRepository);
    }

    @Test
    void updateMilestoneStatus_rejectsSkillWithoutAssignedResources() {
        Skill java = Skill.builder().id(101L).name("Java").build();
        Roadmap roadmap = Roadmap.builder().id(99L).userId(1L).targetCareerRole(careerRole)
                .status(RoadmapStatus.ACTIVE).totalMilestones(1).completedMilestones(0).build();
        RoadmapMilestone milestone = RoadmapMilestone.builder().id(501L).roadmap(roadmap)
                .milestoneOrder(1).targetSkill(java).targetProficiency(3)
                .status(MilestoneStatus.IN_PROGRESS).build();

        when(roadmapRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.of(roadmap));
        when(milestoneRepository.findByIdAndRoadmapId(501L, 99L)).thenReturn(Optional.of(milestone));
        when(milestoneRepository.findByRoadmapIdOrderByMilestoneOrderAsc(99L)).thenReturn(List.of(milestone));
        when(learningResourceRepository.findBySkillId(101L)).thenReturn(List.of());

        UpdateMilestoneStatusRequest request = new UpdateMilestoneStatusRequest();
        request.setStatus(MilestoneStatus.COMPLETED);

        assertThrows(BadRequestException.class,
                () -> roadmapService.updateMilestoneStatus(principal, 99L, 501L, request));
    }

    @Test
    void updateMilestoneStatus_requiresCompletedResourcesAndPassingAssessment() {
        Skill java = Skill.builder().id(101L).name("Java").build();
        LearningResource javaResource = LearningResource.builder().id(301L).title("Java course")
                .url("https://example.com/java").skill(java).build();
        Assessment assessment = Assessment.builder().id(401L).title("Java assignment")
                .skillId(101L).active(true).build();
        Roadmap roadmap = Roadmap.builder().id(99L).userId(1L).targetCareerRole(careerRole)
                .status(RoadmapStatus.ACTIVE).totalMilestones(1).completedMilestones(0).build();
        RoadmapMilestone milestone = RoadmapMilestone.builder().id(501L).roadmap(roadmap)
                .milestoneOrder(1).targetSkill(java).targetProficiency(3)
                .status(MilestoneStatus.IN_PROGRESS).build();
        roadmap.setMilestones(List.of(milestone));

        when(roadmapRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.of(roadmap));
        when(milestoneRepository.findByIdAndRoadmapId(501L, 99L)).thenReturn(Optional.of(milestone));
        when(milestoneRepository.findByRoadmapIdOrderByMilestoneOrderAsc(99L)).thenReturn(List.of(milestone));
        when(learningResourceRepository.findBySkillId(101L)).thenReturn(List.of(javaResource));
        when(assessmentRepository.findBySkillIdAndActiveTrue(101L)).thenReturn(List.of(assessment));
        when(savedResourceRepository.findByUserIdOrderBySavedAtDesc(1L)).thenReturn(List.of());
        when(assessmentAttemptRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());

        UpdateMilestoneStatusRequest request = new UpdateMilestoneStatusRequest();
        request.setStatus(MilestoneStatus.COMPLETED);
        assertThrows(BadRequestException.class,
                () -> roadmapService.updateMilestoneStatus(principal, 99L, 501L, request));

        SavedResource completedResource = SavedResource.builder().userId(1L).resource(javaResource)
                .progressPercent(100).isCompleted(true).build();
        when(savedResourceRepository.findByUserIdOrderBySavedAtDesc(1L)).thenReturn(List.of(completedResource));
        assertThrows(BadRequestException.class,
                () -> roadmapService.updateMilestoneStatus(principal, 99L, 501L, request));

        AssessmentAttempt passedAttempt = AssessmentAttempt.builder().userId(1L).assessmentId(401L)
                .status(AssessmentAttempt.AttemptStatus.SCORED).passed(true).build();
        when(assessmentAttemptRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(passedAttempt));
        when(roadmapRepository.save(any(Roadmap.class))).thenAnswer(inv -> inv.getArgument(0));

        RoadmapResponse response = roadmapService.updateMilestoneStatus(principal, 99L, 501L, request);

        assertEquals(MilestoneStatus.COMPLETED, response.getMilestones().get(0).getStatus());
        assertTrue(response.getMilestones().get(0).isCompletionReady());
        assertTrue(response.getMilestones().get(0).isAssessmentPassed());
        assertEquals(1, response.getMilestones().get(0).getCompletedResourceCount());
    }
}
