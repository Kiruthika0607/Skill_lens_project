package com.skilllens.skill;

import com.skilllens.common.exception.ConflictException;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.security.UserPrincipal;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SkillServiceTest {

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private StudentSkillRepository studentSkillRepository;

    @Mock
    private SkillCategoryRepository categoryRepository;

    @InjectMocks
    private SkillService skillService;

    private UserPrincipal principal;
    private Skill javaSkill;

    @BeforeEach
    void setUp() {
        principal = UserPrincipal.builder()
                .id(1L)
                .email("student@test.com")
                .password("pwd")
                .enabled(true)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
                .build();

        SkillCategory cat = SkillCategory.builder().id(10L).name("Programming").build();
        javaSkill = Skill.builder().id(101L).name("Java").category(cat).build();
    }

    @Test
    void addStudentSkill_savesAndReturnsResponse_whenSkillExists() {
        AddStudentSkillRequest request = new AddStudentSkillRequest();
        request.setSkillId(101L);
        request.setSelfReportedProficiency(3);

        when(skillRepository.findById(101L)).thenReturn(Optional.of(javaSkill));
        when(studentSkillRepository.existsByUserIdAndSkillId(1L, 101L)).thenReturn(false);

        StudentSkill saved = StudentSkill.builder()
                .id(501L)
                .userId(1L)
                .skill(javaSkill)
                .selfReportedProficiency(3)
                .build();
        when(studentSkillRepository.save(any(StudentSkill.class))).thenReturn(saved);

        StudentSkillResponse response = skillService.addStudentSkill(principal, request);

        assertNotNull(response);
        assertEquals(501L, response.getId());
        assertEquals("Java", response.getSkillName());
        assertEquals(3, response.getSelfReportedProficiency());
        verify(studentSkillRepository).save(any(StudentSkill.class));
    }

    @Test
    void addStudentSkill_throwsConflictException_whenAlreadyAdded() {
        AddStudentSkillRequest request = new AddStudentSkillRequest();
        request.setSkillId(101L);
        request.setSelfReportedProficiency(2);

        when(skillRepository.findById(101L)).thenReturn(Optional.of(javaSkill));
        when(studentSkillRepository.existsByUserIdAndSkillId(1L, 101L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> skillService.addStudentSkill(principal, request));
        verify(studentSkillRepository, never()).save(any(StudentSkill.class));
    }

    @Test
    void addStudentSkill_throwsNotFound_whenSkillDoesNotExist() {
        AddStudentSkillRequest request = new AddStudentSkillRequest();
        request.setSkillId(999L);
        request.setSelfReportedProficiency(1);

        when(skillRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> skillService.addStudentSkill(principal, request));
    }
}
