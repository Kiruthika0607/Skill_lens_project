package com.skilllens.student;

import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Student profile service — manages profile read and update operations.
 */
@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfile(UserPrincipal principal) {
        StudentProfile profile = profileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found."));
        return toResponse(profile);
    }

    @Transactional
    public StudentProfileResponse updateProfile(UserPrincipal principal, UpdateProfileRequest request) {
        StudentProfile profile = profileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found."));

        applyUpdates(profile, request);
        profile = profileRepository.save(profile);
        return toResponse(profile);
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    private void applyUpdates(StudentProfile p, UpdateProfileRequest r) {
        if (r.getFirstName() != null)        p.setFirstName(r.getFirstName().trim());
        if (r.getLastName() != null)         p.setLastName(r.getLastName().trim());
        if (r.getPhone() != null)            p.setPhone(r.getPhone().trim());
        if (r.getBio() != null)              p.setBio(r.getBio().trim());
        if (r.getResolvedInstitution() != null) p.setInstitution(r.getResolvedInstitution().trim());
        if (r.getDegree() != null)           p.setDegree(r.getDegree().trim());
        if (r.getResolvedDepartment() != null)  p.setDepartment(r.getResolvedDepartment().trim());
        if (r.getGraduationYear() != null)   p.setGraduationYear(r.getGraduationYear());
        if (r.getGpa() != null)              p.setGpa(r.getGpa());
        if (r.getGpaScale() != null)         p.setGpaScale(r.getGpaScale());
        if (r.getPreferredCareerRole() != null) p.setPreferredCareerRole(r.getPreferredCareerRole().trim());
        if (r.getPreferredLocations() != null)  p.setPreferredLocations(r.getPreferredLocations());
        if (r.getOpenToRemote() != null)     p.setOpenToRemote(r.getOpenToRemote());
        if (r.getYearsOfExperience() != null) p.setYearsOfExperience(r.getYearsOfExperience());
        if (r.getLinkedinUrl() != null)      p.setLinkedinUrl(r.getLinkedinUrl().trim());
        if (r.getGithubUrl() != null)        p.setGithubUrl(r.getGithubUrl().trim());
        if (r.getPortfolioUrl() != null)     p.setPortfolioUrl(r.getPortfolioUrl().trim());
    }

    StudentProfileResponse toResponse(StudentProfile p) {
        int comp = calculateCompletion(p);
        String major = p.getDepartment() != null ? p.getDepartment() : p.getDegree();
        return StudentProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .phone(p.getPhone())
                .bio(p.getBio())
                .avatarUrl(p.getAvatarUrl())
                .institution(p.getInstitution())
                .university(p.getInstitution())
                .degree(p.getDegree())
                .department(p.getDepartment())
                .major(major)
                .graduationYear(p.getGraduationYear())
                .gpa(p.getGpa())
                .gpaScale(p.getGpaScale())
                .preferredCareerRole(p.getPreferredCareerRole())
                .preferredLocations(p.getPreferredLocations())
                .openToRemote(p.getOpenToRemote())
                .yearsOfExperience(p.getYearsOfExperience())
                .linkedinUrl(p.getLinkedinUrl())
                .githubUrl(p.getGithubUrl())
                .portfolioUrl(p.getPortfolioUrl())
                .profileCompletionPercent(comp)
                .profileCompletionPercentage(comp)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private int calculateCompletion(StudentProfile p) {
        int filled = 0;
        int total = 12;
        if (StringUtils.hasText(p.getFirstName()))           filled++;
        if (StringUtils.hasText(p.getLastName()))            filled++;
        if (StringUtils.hasText(p.getInstitution()))         filled++;
        if (StringUtils.hasText(p.getDegree()))              filled++;
        if (StringUtils.hasText(p.getDepartment()))          filled++;
        if (p.getGraduationYear() != null)                   filled++;
        if (p.getGpa() != null)                              filled++;
        if (StringUtils.hasText(p.getPreferredCareerRole())) filled++;
        if (StringUtils.hasText(p.getBio()))                 filled++;
        if (StringUtils.hasText(p.getLinkedinUrl()))         filled++;
        if (StringUtils.hasText(p.getGithubUrl()))           filled++;
        if (StringUtils.hasText(p.getPhone()))               filled++;
        return (int) ((double) filled / total * 100);
    }
}
