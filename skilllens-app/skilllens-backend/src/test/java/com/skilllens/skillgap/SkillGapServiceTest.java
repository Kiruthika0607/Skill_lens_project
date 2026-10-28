package com.skilllens.skillgap;

import com.skilllens.career.CareerRequiredSkill;
import com.skilllens.career.CareerRequiredSkillRepository;
import com.skilllens.career.CareerRole;
import com.skilllens.career.CareerRoleRepository;
import com.skilllens.security.UserPrincipal;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillGapServiceTest {

    @Mock
    private CareerRoleRepository careerRoleRepository;

    @Mock
    private CareerRequiredSkillRepository requiredSkillRepository;

    @Mock
    private StudentSkillRepository studentSkillRepository;

    @Mock
    private SkillRepository skillRepository;

    @InjectMocks
    private SkillGapService skillGapService;

    private UserPrincipal principal;
    private CareerRole role;
    private Skill javaSkill;
    private Skill reactSkill;

    @BeforeEach
    void setUp() {
        principal = UserPrincipal.builder()
                .id(1L)
                .email("student@test.com")
                .password("password")
                .enabled(true)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
                .build();

        role = CareerRole.builder().id(10L).title("Full Stack Engineer").build();
        javaSkill = Skill.builder().id(101L).name("Java").build();
        reactSkill = Skill.builder().id(102L).name("React").build();
    }

    @Test
    void calculateGap_withAssessedSkills_calculatesCorrectWeightedGap() {
        when(careerRoleRepository.findById(10L)).thenReturn(Optional.of(role));

        List<CareerRequiredSkill> requirements = List.of(
                CareerRequiredSkill.builder().careerId(10L).skillId(101L).minProficiency(4).weight(1.0).build(),
                CareerRequiredSkill.builder().careerId(10L).skillId(102L).minProficiency(2).weight(1.0).build()
        );
        when(requiredSkillRepository.findByCareerId(10L)).thenReturn(requirements);

        when(skillRepository.findById(101L)).thenReturn(Optional.of(javaSkill));
        when(skillRepository.findById(102L)).thenReturn(Optional.of(reactSkill));

        // Java assessed at 2 (req 4, gap = (4-2)/4 = 0.5)
        // React assessed at 2 (req 2, gap = (2-2)/2 = 0.0)
        // Overall gap = (1.0*0.5 + 1.0*0.0) / (1.0+1.0) = 0.25 -> 25.0%
        List<StudentSkill> studentSkills = List.of(
                StudentSkill.builder().userId(1L).skill(javaSkill).assessedProficiency(2).build(),
                StudentSkill.builder().userId(1L).skill(reactSkill).assessedProficiency(2).build()
        );
        when(studentSkillRepository.findByUserId(1L)).thenReturn(studentSkills);

        SkillGapReport report = skillGapService.calculateGap(principal, 10L);

        assertNotNull(report);
        assertEquals(10L, report.getCareerId());
        assertEquals("Full Stack Engineer", report.getCareerTitle());
        assertEquals(25.0, report.getOverallGapPercentage());
        assertEquals(2, report.getAssessedSkillCount());
        assertEquals(0, report.getNotAssessedCount());
        assertEquals(2, report.getGapItems().size());
    }

    @Test
    void calculateGap_withUnassessedSkill_excludesFromAggregateDenominator() {
        when(careerRoleRepository.findById(10L)).thenReturn(Optional.of(role));

        List<CareerRequiredSkill> requirements = List.of(
                CareerRequiredSkill.builder().careerId(10L).skillId(101L).minProficiency(4).weight(1.0).build(),
                CareerRequiredSkill.builder().careerId(10L).skillId(102L).minProficiency(2).weight(1.0).build()
        );
        when(requiredSkillRepository.findByCareerId(10L)).thenReturn(requirements);

        when(skillRepository.findById(101L)).thenReturn(Optional.of(javaSkill));
        when(skillRepository.findById(102L)).thenReturn(Optional.of(reactSkill));

        // Only Java is assessed at 2 (gap = 0.5 -> 50.0%)
        // React is unassessed
        List<StudentSkill> studentSkills = List.of(
                StudentSkill.builder().userId(1L).skill(javaSkill).assessedProficiency(2).build()
        );
        when(studentSkillRepository.findByUserId(1L)).thenReturn(studentSkills);

        SkillGapReport report = skillGapService.calculateGap(principal, 10L);

        assertNotNull(report);
        assertEquals(50.0, report.getOverallGapPercentage());
        assertEquals(1, report.getAssessedSkillCount());
        assertEquals(1, report.getNotAssessedCount());

        SkillGapItem unassessedItem = report.getGapItems().stream()
                .filter(i -> i.getSkillId().equals(102L))
                .findFirst()
                .orElseThrow();
        assertEquals("NOT_ASSESSED", unassessedItem.getAssessmentStatus());
        assertNull(unassessedItem.getNormalizedGap());
    }

    @Test
    void calculateGap_usesSelfReportedResumeSkillWhenNoAssessmentExists() {
        when(careerRoleRepository.findById(10L)).thenReturn(Optional.of(role));
        when(requiredSkillRepository.findByCareerId(10L)).thenReturn(List.of(
                CareerRequiredSkill.builder().careerId(10L).skillId(101L).minProficiency(4).weight(1.0).build(),
                CareerRequiredSkill.builder().careerId(10L).skillId(102L).minProficiency(2).weight(1.0).build()
        ));
        when(skillRepository.findById(101L)).thenReturn(Optional.of(javaSkill));
        when(skillRepository.findById(102L)).thenReturn(Optional.of(reactSkill));
        when(studentSkillRepository.findByUserId(1L)).thenReturn(List.of(
                StudentSkill.builder().userId(1L).skill(javaSkill).selfReportedProficiency(3).build(),
                StudentSkill.builder().userId(1L).skill(reactSkill).assessedProficiency(2)
                        .selfReportedProficiency(1).build()
        ));

        SkillGapReport report = skillGapService.calculateGap(principal, 10L);

        assertEquals(12.5, report.getOverallGapPercentage());
        assertEquals(1, report.getAssessedSkillCount());
        assertEquals(1, report.getSelfReportedSkillCount());
        assertEquals(0, report.getNotAssessedCount());
        SkillGapItem resumeSkill = report.getGapItems().stream()
                .filter(item -> item.getSkillId().equals(101L))
                .findFirst()
                .orElseThrow();
        assertEquals(3, resumeSkill.getCurrentProficiency());
        assertEquals("SELF_REPORTED", resumeSkill.getProficiencySource());
        assertEquals("BELOW_REQUIREMENT", resumeSkill.getAssessmentStatus());
    }
}
