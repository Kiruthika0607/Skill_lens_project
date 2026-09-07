package com.skilllens.service;

import com.skilllens.dto.AdminDashboardMetricsDto;
import com.skilllens.dto.TrendDto;
import com.skilllens.dto.UserSummaryDto;
import com.skilllens.entity.AdminLog;
import com.skilllens.entity.StudentProfile;
import com.skilllens.entity.User;
import com.skilllens.exception.BadRequestException;
import com.skilllens.exception.ResourceNotFoundException;
import com.skilllens.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final OccupationRepository occupationRepository;
    private final JobPostingRepository jobRepository;
    private final CourseRepository courseRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final AdminLogRepository adminLogRepository;
    private final TrendService trendService;
    private final AuthService authService;

    public AdminDashboardMetricsDto getDashboardMetrics() {
        long totalStudents = userRepository.countByRole("STUDENT");
        long totalJobs = jobRepository.count();
        long totalSkills = skillRepository.count();
        long totalOccupations = occupationRepository.count();
        long totalCourses = courseRepository.count();
        long totalProjects = projectRepository.count();
        long totalCerts = certificationRepository.count();

        List<TrendDto> topSkills = trendService.getTopDemandedSkills(6);

        // Location Distribution
        List<Object[]> locData = jobRepository.getLocationDistribution();
        List<Map<String, Object>> locationList = new ArrayList<>();
        for (Object[] row : locData) {
            Map<String, Object> map = new HashMap<>();
            map.put("location", row[0]);
            map.put("count", row[1]);
            locationList.add(map);
        }

        // Job Type Distribution
        List<Object[]> typeData = jobRepository.getJobTypeDistribution();
        List<Map<String, Object>> typeList = new ArrayList<>();
        for (Object[] row : typeData) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", row[0]);
            map.put("count", row[1]);
            typeList.add(map);
        }

        long remoteCount = jobRepository.countByRemote(true);
        long onsiteCount = totalJobs - remoteCount;

        return AdminDashboardMetricsDto.builder()
                .totalStudents(totalStudents)
                .totalJobs(totalJobs)
                .totalSkills(totalSkills)
                .totalOccupations(totalOccupations)
                .totalCourses(totalCourses)
                .totalProjects(totalProjects)
                .totalCertifications(totalCerts)
                .topDemandedSkills(topSkills)
                .locationDistribution(locationList)
                .jobTypeDistribution(typeList)
                .remoteJobsCount(remoteCount)
                .onsiteJobsCount(onsiteCount)
                .build();
    }

    public List<UserSummaryDto> getAllStudents() {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> "STUDENT".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());

        return students.stream().map(u -> {
            Optional<StudentProfile> profileOpt = profileRepository.findByUser(u);
            return UserSummaryDto.builder()
                    .id(u.getId())
                    .fullName(u.getFullName())
                    .email(u.getEmail())
                    .role(u.getRole())
                    .active(u.isActive())
                    .college(profileOpt.map(StudentProfile::getCollege).orElse("N/A"))
                    .degree(profileOpt.map(StudentProfile::getDegree).orElse("N/A"))
                    .department(profileOpt.map(StudentProfile::getDepartment).orElse("N/A"))
                    .graduationYear(profileOpt.map(StudentProfile::getGraduationYear).orElse(null))
                    .createdAt(u.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new BadRequestException("Cannot deactivate administrator accounts");
        }

        user.setActive(!user.isActive());
        userRepository.save(user);

        logAction("TOGGLE_STATUS", "User", user.getId(), "User active status set to: " + user.isActive());
        return user.isActive();
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new BadRequestException("Cannot delete administrator accounts");
        }

        userRepository.delete(user);
        logAction("DELETE_USER", "User", userId, "Deleted student account: " + user.getEmail());
    }

    @Transactional
    public void logAction(String action, String targetEntity, Long targetId, String details) {
        try {
            User admin = authService.getCurrentAuthenticatedUser();
            AdminLog log = AdminLog.builder()
                    .adminUser(admin)
                    .action(action)
                    .targetEntity(targetEntity)
                    .targetId(targetId)
                    .details(details)
                    .build();
            adminLogRepository.save(log);
        } catch (Exception ignored) {
            // Silently skip if called in non-authenticated batch/seed context
        }
    }

    public List<AdminLog> getRecentLogs() {
        return adminLogRepository.findTop20ByOrderByCreatedAtDesc();
    }

    public List<Map<String, Object>> getDatasetStatuses() {
        List<Map<String, Object>> datasets = new ArrayList<>();

        datasets.add(Map.of("dataset", "Skill Taxonomy", "source", "ESCO / O*NET Standard", "type", "STATIC MASTER", "count", skillRepository.count(), "status", "VERIFIED"));
        datasets.add(Map.of("dataset", "Occupations & Careers", "source", "O*NET Career Matrix", "type", "STATIC MASTER", "count", occupationRepository.count(), "status", "VERIFIED"));
        datasets.add(Map.of("dataset", "Live Job Market Data", "source", "Greenhouse, Lever, Direct Feeds", "type", "DYNAMIC", "count", jobRepository.count(), "status", "ACTIVE"));
        datasets.add(Map.of("dataset", "Curated Courses Catalog", "source", "Coursera, edX, MIT OpenCourseWare", "type", "STATIC", "count", courseRepository.count(), "status", "VERIFIED"));
        datasets.add(Map.of("dataset", "Portfolio Projects", "source", "Industry Open Source Projects", "type", "STATIC", "count", projectRepository.count(), "status", "VERIFIED"));
        datasets.add(Map.of("dataset", "Professional Certifications", "source", "AWS, Google Cloud, Microsoft, Cisco", "type", "STATIC", "count", certificationRepository.count(), "status", "VERIFIED"));

        return datasets;
    }
}
