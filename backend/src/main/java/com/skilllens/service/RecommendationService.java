package com.skilllens.service;

import com.skilllens.dto.CertificationDto;
import com.skilllens.dto.CourseDto;
import com.skilllens.dto.ProjectDto;
import com.skilllens.dto.SkillGapAnalysisResponse;
import com.skilllens.entity.Certification;
import com.skilllens.entity.Course;
import com.skilllens.entity.Project;
import com.skilllens.entity.Skill;
import com.skilllens.repository.CertificationRepository;
import com.skilllens.repository.CourseRepository;
import com.skilllens.repository.ProjectRepository;
import com.skilllens.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final CourseRepository courseRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final SkillRepository skillRepository;
    private final SkillGapService skillGapService;

    public List<CourseDto> getRecommendedCourses() {
        Set<Long> gapSkillIds = getMissingSkillIds();
        List<Course> courses;

        if (!gapSkillIds.isEmpty()) {
            courses = courseRepository.findBySkillIdIn(gapSkillIds);
            if (courses.isEmpty()) {
                courses = courseRepository.findAll();
            }
        } else {
            courses = courseRepository.findAll();
        }

        return courses.stream().map(c -> CourseDto.builder()
                .id(c.getId())
                .title(c.getTitle())
                .provider(c.getProvider())
                .skillId(c.getSkill().getId())
                .skillName(c.getSkill().getName())
                .difficulty(c.getDifficulty())
                .duration(c.getDuration())
                .url(c.getUrl())
                .description(c.getDescription())
                .build()
        ).limit(10).collect(Collectors.toList());
    }

    public List<ProjectDto> getRecommendedProjects() {
        Set<Long> gapSkillIds = getMissingSkillIds();
        List<Project> projects;

        if (!gapSkillIds.isEmpty()) {
            projects = projectRepository.findProjectsBySkillIds(gapSkillIds);
            if (projects.isEmpty()) {
                projects = projectRepository.findAll();
            }
        } else {
            projects = projectRepository.findAll();
        }

        return projects.stream().map(p -> ProjectDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .difficulty(p.getDifficulty())
                .estimatedDuration(p.getEstimatedDuration())
                .githubUrl(p.getGithubUrl())
                .skillsCovered(p.getSkillsCovered().stream().map(Skill::getName).collect(Collectors.toList()))
                .build()
        ).limit(8).collect(Collectors.toList());
    }

    public List<CertificationDto> getRecommendedCertifications() {
        Set<Long> gapSkillIds = getMissingSkillIds();
        List<Certification> certs;

        if (!gapSkillIds.isEmpty()) {
            certs = certificationRepository.findCertificationsBySkillIds(gapSkillIds);
            if (certs.isEmpty()) {
                certs = certificationRepository.findAll();
            }
        } else {
            certs = certificationRepository.findAll();
        }

        return certs.stream().map(c -> CertificationDto.builder()
                .id(c.getId())
                .name(c.getName())
                .provider(c.getProvider())
                .difficulty(c.getDifficulty())
                .url(c.getUrl())
                .description(c.getDescription())
                .skills(c.getSkills().stream().map(Skill::getName).collect(Collectors.toList()))
                .build()
        ).limit(8).collect(Collectors.toList());
    }

    private Set<Long> getMissingSkillIds() {
        SkillGapAnalysisResponse gap = skillGapService.getSkillGapAnalysisForCurrentStudent();
        if (gap == null || gap.getMissingSkills().isEmpty()) {
            return Collections.emptySet();
        }

        return gap.getMissingSkills().stream()
                .map(skillRepository::findByNameIgnoreCase)
                .flatMap(java.util.Optional::stream)
                .map(Skill::getId)
                .collect(Collectors.toSet());
    }
}
