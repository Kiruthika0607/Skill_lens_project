package com.skilllens.opportunity;

import com.skilllens.common.exception.ConflictException;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.Skill;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OpportunityServiceTest {

    @Mock
    private OpportunityRepository opportunityRepository;

    @Mock
    private SavedOpportunityRepository savedOpportunityRepository;

    @Mock
    private StudentSkillRepository studentSkillRepository;

    @InjectMocks
    private OpportunityService opportunityService;

    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        principal = UserPrincipal.builder()
                .id(1L)
                .email("student@test.com")
                .password("pwd")
                .enabled(true)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
                .build();
    }

    @Test
    void getMatchedOpportunities_calculatesPercentageAndRanksProperly() {
        Skill java = Skill.builder().id(10L).name("Java").build();
        Skill docker = Skill.builder().id(20L).name("Docker").build();
        Skill python = Skill.builder().id(30L).name("Python").build();

        // Student has Java and Docker assessed
        StudentSkill ss1 = StudentSkill.builder().userId(1L).skill(java).assessedProficiency(3).build();
        StudentSkill ss2 = StudentSkill.builder().userId(1L).skill(docker).assessedProficiency(2).build();
        when(studentSkillRepository.findByUserId(1L)).thenReturn(List.of(ss1, ss2));

        // Opp 1 requires Java + Docker (2/2 = 100%)
        Opportunity opp1 = Opportunity.builder()
                .id(101L)
                .title("Backend Intern")
                .organization("Acme Corp")
                .opportunityType(OpportunityType.INTERNSHIP)
                .isActive(true)
                .build();
        OpportunitySkill os1 = OpportunitySkill.builder().opportunity(opp1).skill(java).build();
        OpportunitySkill os2 = OpportunitySkill.builder().opportunity(opp1).skill(docker).build();
        opp1.setRequiredSkills(new ArrayList<>(List.of(os1, os2)));

        // Opp 2 requires Java + Python (1/2 = 50%)
        Opportunity opp2 = Opportunity.builder()
                .id(102L)
                .title("Data Engineer")
                .organization("Beta Inc")
                .opportunityType(OpportunityType.JOB)
                .isActive(true)
                .build();
        OpportunitySkill os3 = OpportunitySkill.builder().opportunity(opp2).skill(java).build();
        OpportunitySkill os4 = OpportunitySkill.builder().opportunity(opp2).skill(python).build();
        opp2.setRequiredSkills(new ArrayList<>(List.of(os3, os4)));

        when(opportunityRepository.findByIsActiveTrue()).thenReturn(List.of(opp2, opp1));
        when(savedOpportunityRepository.findByUserIdAndOpportunityId(eq(1L), anyLong())).thenReturn(Optional.empty());

        List<OpportunityMatchResponse> matches = opportunityService.getMatchedOpportunities(principal, 10);

        assertNotNull(matches);
        assertEquals(2, matches.size());
        // Opp 1 should be ranked first (100% vs 50%)
        assertEquals(101L, matches.get(0).getOpportunity().getId());
        assertEquals(100.0, matches.get(0).getMatchPercentage());
        assertEquals(2, matches.get(0).getMatchedSkillCount());

        assertEquals(102L, matches.get(1).getOpportunity().getId());
        assertEquals(50.0, matches.get(1).getMatchPercentage());
        assertEquals(1, matches.get(1).getMatchedSkillCount());
    }

    @Test
    void saveOpportunity_successfullySaves_andThrowsConflictIfAlreadySaved() {
        Opportunity opp = Opportunity.builder().id(101L).title("Backend Intern").build();
        when(opportunityRepository.findById(101L)).thenReturn(Optional.of(opp));
        when(savedOpportunityRepository.existsByUserIdAndOpportunityId(1L, 101L)).thenReturn(false);

        SavedOpportunity saved = SavedOpportunity.builder()
                .id(55L)
                .userId(1L)
                .opportunity(opp)
                .status(ApplicationStatus.SAVED)
                .build();
        when(savedOpportunityRepository.save(any(SavedOpportunity.class))).thenReturn(saved);

        SaveOpportunityRequest req = new SaveOpportunityRequest();
        req.setNotes("Bookmarked for later");

        SavedOpportunity result = opportunityService.saveOpportunity(principal, 101L, req);

        assertNotNull(result);
        assertEquals(55L, result.getId());
        assertEquals(ApplicationStatus.SAVED, result.getStatus());

        // Test conflict
        when(savedOpportunityRepository.existsByUserIdAndOpportunityId(1L, 101L)).thenReturn(true);
        assertThrows(ConflictException.class, () -> opportunityService.saveOpportunity(principal, 101L, req));
    }
}
