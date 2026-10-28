package com.skilllens.resume;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillCategory;
import com.skilllens.skill.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResumeParserServiceTest {

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ResumeParserService parserService;

    private List<Skill> catalog;

    @BeforeEach
    void setUp() {
        SkillCategory backend = SkillCategory.builder().id(1L).name("Backend Development").build();
        SkillCategory devops = SkillCategory.builder().id(2L).name("DevOps").build();

        Skill java = Skill.builder().id(101L).name("Java").category(backend).build();
        Skill spring = Skill.builder().id(102L).name("Spring Boot").category(backend).build();
        Skill docker = Skill.builder().id(103L).name("Docker").category(devops).build();
        Skill kubernetes = Skill.builder().id(104L).name("Kubernetes").category(devops).build();

        catalog = List.of(java, spring, docker, kubernetes);
    }

    @Test
    void parseResumeText_matchesCatalogSkills_andCalculatesProficiency() {
        when(skillRepository.findAll()).thenReturn(catalog);

        String sampleResume = """
                Jane Doe
                Email: jane.doe@engineering.edu
                Phone: +1 (555) 234-5678

                SUMMARY
                Passionate software engineering student with expertise in Java, Spring Boot, and Docker.
                Built multiple microservices with Java and Spring Boot. Deployed containerized applications with Docker.
                Used Java concurrency for high throughput data streaming.

                EDUCATION
                B.Tech in Computer Science and Engineering
                XYZ Institute of Technology, CGPA 8.8

                EXPERIENCE
                Backend Engineering Intern at TechFlow
                - Developed REST APIs in Java using Spring Boot
                - Orchestrated containers with Docker
                """;

        ParsedResumeDto parsed = parserService.parseResumeText(sampleResume);

        assertNotNull(parsed);
        assertEquals("jane.doe@engineering.edu", parsed.getEmail());
        assertNotNull(parsed.getPhone());
        assertFalse(parsed.getSkills().isEmpty());

        // Java appeared 4 times, Spring Boot 3 times, Docker 3 times, Kubernetes 0 times
        ExtractedSkillDto javaSkill = parsed.getSkills().stream()
                .filter(s -> s.getSkillName().equals("Java"))
                .findFirst()
                .orElse(null);

        assertNotNull(javaSkill);
        assertTrue(javaSkill.getMatchedOccurrences() >= 3);
        assertEquals(3, javaSkill.getSuggestedProficiency()); // 3 or 4 occurrences gives proficiency 3
        assertEquals("Backend Development", javaSkill.getCategory());

        // Verify Kubernetes was NOT matched
        boolean hasK8s = parsed.getSkills().stream().anyMatch(s -> s.getSkillName().equals("Kubernetes"));
        assertFalse(hasK8s);

        // Verify Education extraction
        assertFalse(parsed.getEducation().isEmpty());
        assertTrue(parsed.getEducation().stream().anyMatch(e -> e.contains("Computer Science")));
    }
}
