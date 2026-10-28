package com.skilllens.career;

import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import com.skilllens.student.StudentProfile;
import com.skilllens.student.StudentProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CareerServiceTest {

    @Mock
    private CareerRoleRepository careerRoleRepository;
    @Mock
    private CareerRequiredSkillRepository requiredSkillRepository;
    @Mock
    private CareerRecommendationRepository recommendationRepository;
    @Mock
    private StudentSkillRepository studentSkillRepository;
    @Mock
    private SkillRepository skillRepository;
    @Mock
    private StudentProfileRepository profileRepository;

    @InjectMocks
    private CareerService careerService;

    @Test
    void generateRecommendations_usesResumeSkillAndPrioritizesProfilePreference() {
        UserPrincipal principal = UserPrincipal.builder().id(1L).email("student@test.com").build();
        CareerRole preferredRole = CareerRole.builder().id(10L).title("Full Stack Engineer")
                .description("Build web applications").industry("Technology").build();
        CareerRole otherRole = CareerRole.builder().id(20L).title("Backend Engineer").build();
        Skill java = Skill.builder().id(101L).name("Java").build();

        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(
                StudentProfile.builder().userId(1L).preferredCareerRole("Full Stack Engineer").build()));
        when(careerRoleRepository.findByActiveTrue(Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(preferredRole, otherRole)));
        when(requiredSkillRepository.findByCareerId(10L)).thenReturn(List.of(
                CareerRequiredSkill.builder().careerId(10L).skillId(101L).minProficiency(4).weight(1.0).build()));
        when(requiredSkillRepository.findByCareerId(20L)).thenReturn(List.of(
                CareerRequiredSkill.builder().careerId(20L).skillId(101L).minProficiency(2).weight(1.0).build()));
        when(studentSkillRepository.findByUserId(1L)).thenReturn(List.of(
                StudentSkill.builder().userId(1L).skill(java).selfReportedProficiency(3).build()));
        when(recommendationRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<CareerRecommendationResponse> results = careerService.generateRecommendations(principal);

        assertEquals(2, results.size());
        assertEquals(10L, results.get(0).getCareerId());
        assertTrue(results.get(0).isProfilePreferred());
        assertEquals(75.0, results.get(0).getMatchScore());
        assertEquals(20L, results.get(1).getCareerId());
        assertEquals(100.0, results.get(1).getMatchScore());
        assertTrue(results.get(0).getExplanation().contains("self-reported levels"));
        verify(recommendationRepository).deleteAllForUser(1L);
    }
}
