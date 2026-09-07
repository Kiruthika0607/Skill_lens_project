package com.skilllens.service;

import com.skilllens.dto.AddSkillRequest;
import com.skilllens.dto.StudentProfileDto;
import com.skilllens.dto.StudentSkillDto;
import com.skilllens.dto.UpdateProfileRequest;
import com.skilllens.entity.*;
import com.skilllens.exception.BadRequestException;
import com.skilllens.exception.ResourceNotFoundException;
import com.skilllens.repository.OccupationRepository;
import com.skilllens.repository.StudentProfileRepository;
import com.skilllens.repository.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final OccupationRepository occupationRepository;
    private final SkillService skillService;
    private final AuthService authService;

    public StudentProfile getCurrentStudentProfile() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return profileRepository.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + currentUser.getEmail()));
    }

    public StudentProfileDto getCurrentProfileDto() {
        StudentProfile profile = getCurrentStudentProfile();
        return mapToDto(profile);
    }

    @Transactional
    public StudentProfileDto updateProfile(UpdateProfileRequest request) {
        StudentProfile profile = getCurrentStudentProfile();

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            User user = profile.getUser();
            user.setFullName(request.getFullName().trim());
        }

        if (request.getCollege() != null) profile.setCollege(request.getCollege().trim());
        if (request.getDegree() != null) profile.setDegree(request.getDegree().trim());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment().trim());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getCgpa() != null) profile.setCgpa(request.getCgpa());
        if (request.getCareerInterest() != null) profile.setCareerInterest(request.getCareerInterest().trim());
        if (request.getBio() != null) profile.setBio(request.getBio().trim());

        if (request.getTargetOccupationId() != null) {
            Occupation occupation = occupationRepository.findById(request.getTargetOccupationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Occupation not found with ID: " + request.getTargetOccupationId()));
            profile.setTargetOccupationId(occupation.getId());
        }

        StudentProfile updated = profileRepository.save(profile);
        return mapToDto(updated);
    }

    @Transactional
    public StudentProfileDto addSkillToProfile(AddSkillRequest request) {
        StudentProfile profile = getCurrentStudentProfile();

        // 1. Deterministic normalization from raw input or alias
        Skill canonicalSkill = skillService.normalizeAndResolveSkill(request.getSkillName());

        // 2. Check duplicate
        Optional<StudentSkill> existing = studentSkillRepository.findByStudentProfileIdAndSkillId(profile.getId(), canonicalSkill.getId());
        if (existing.isPresent()) {
            // Update proficiency and experience
            StudentSkill ss = existing.get();
            if (request.getProficiencyLevel() != null) ss.setProficiencyLevel(request.getProficiencyLevel());
            if (request.getYearsExperience() != null) ss.setYearsExperience(request.getYearsExperience());
            studentSkillRepository.save(ss);
        } else {
            StudentSkill ss = StudentSkill.builder()
                    .studentProfile(profile)
                    .skill(canonicalSkill)
                    .proficiencyLevel(request.getProficiencyLevel() != null ? request.getProficiencyLevel() : "INTERMEDIATE")
                    .yearsExperience(request.getYearsExperience() != null ? request.getYearsExperience() : BigDecimal.ZERO)
                    .build();
            studentSkillRepository.save(ss);
            profile.getSkills().add(ss);
        }

        return mapToDto(profileRepository.save(profile));
    }

    @Transactional
    public StudentProfileDto removeSkillFromProfile(Long skillId) {
        StudentProfile profile = getCurrentStudentProfile();
        studentSkillRepository.deleteByStudentProfileIdAndSkillId(profile.getId(), skillId);
        profile.getSkills().removeIf(s -> s.getSkill().getId().equals(skillId));
        return mapToDto(profileRepository.save(profile));
    }

    public StudentProfileDto mapToDto(StudentProfile profile) {
        String targetTitle = null;
        if (profile.getTargetOccupationId() != null) {
            targetTitle = occupationRepository.findById(profile.getTargetOccupationId())
                    .map(Occupation::getTitle)
                    .orElse(null);
        }

        List<StudentSkillDto> skillDtos = profile.getSkills().stream().map(ss -> StudentSkillDto.builder()
                .id(ss.getId())
                .skillId(ss.getSkill().getId())
                .skillName(ss.getSkill().getName())
                .categoryName(ss.getSkill().getCategory().getName())
                .proficiencyLevel(ss.getProficiencyLevel())
                .yearsExperience(ss.getYearsExperience())
                .build()
        ).collect(Collectors.toList());

        return StudentProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())
                .college(profile.getCollege())
                .degree(profile.getDegree())
                .department(profile.getDepartment())
                .graduationYear(profile.getGraduationYear())
                .cgpa(profile.getCgpa())
                .careerInterest(profile.getCareerInterest())
                .targetOccupationId(profile.getTargetOccupationId())
                .targetOccupationTitle(targetTitle)
                .bio(profile.getBio())
                .skills(skillDtos)
                .build();
    }
}
