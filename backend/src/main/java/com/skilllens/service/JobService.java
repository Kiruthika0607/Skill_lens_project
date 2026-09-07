package com.skilllens.service;

import com.skilllens.dto.JobFormRequest;
import com.skilllens.dto.JobMatchDto;
import com.skilllens.dto.JobPostingDto;
import com.skilllens.dto.SkillDto;
import com.skilllens.entity.*;
import com.skilllens.exception.BadRequestException;
import com.skilllens.exception.ResourceNotFoundException;
import com.skilllens.repository.JobPostingRepository;
import com.skilllens.repository.SavedJobRepository;
import com.skilllens.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobPostingRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    private final SkillRepository skillRepository;
    private final StudentProfileService studentProfileService;
    private final AuthService authService;

    public Page<JobMatchDto> getJobsForStudent(String search, Boolean remote, String jobType, Pageable pageable) {
        StudentProfile profile = studentProfileService.getCurrentStudentProfile();
        User currentUser = profile.getUser();

        Page<JobPosting> jobsPage = jobRepository.searchJobs(
                (search != null && !search.trim().isEmpty()) ? search.trim() : null,
                remote,
                (jobType != null && !jobType.trim().isEmpty()) ? jobType.trim() : null,
                pageable
        );

        Set<Long> studentSkillIds = profile.getSkills().stream()
                .map(ss -> ss.getSkill().getId())
                .collect(Collectors.toSet());

        Set<Long> savedJobIds = savedJobRepository.findByUserIdOrderBySavedAtDesc(currentUser.getId()).stream()
                .map(sj -> sj.getJob().getId())
                .collect(Collectors.toSet());

        return jobsPage.map(job -> calculateJobMatch(job, studentSkillIds, savedJobIds.contains(job.getId())));
    }

    public JobMatchDto getJobDetailForStudent(Long jobId) {
        JobPosting job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

        StudentProfile profile = studentProfileService.getCurrentStudentProfile();
        Set<Long> studentSkillIds = profile.getSkills().stream()
                .map(ss -> ss.getSkill().getId())
                .collect(Collectors.toSet());

        boolean isSaved = savedJobRepository.existsByUserIdAndJobId(profile.getUser().getId(), jobId);

        return calculateJobMatch(job, studentSkillIds, isSaved);
    }

    private JobMatchDto calculateJobMatch(JobPosting job, Set<Long> studentSkillIds, boolean isSaved) {
        Set<Skill> required = job.getRequiredSkills();
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        if (required.isEmpty()) {
            return JobMatchDto.builder()
                    .id(job.getId())
                    .title(job.getTitle())
                    .company(job.getCompany())
                    .location(job.getLocation())
                    .description(job.getDescription())
                    .salary(job.getSalary())
                    .jobType(job.getJobType())
                    .remote(job.isRemote())
                    .postedDate(job.getPostedDate())
                    .applyUrl(job.getApplyUrl())
                    .matchPercentage(0.0)
                    .matchedSkills(Collections.emptyList())
                    .missingSkills(Collections.emptyList())
                    .saved(isSaved)
                    .build();
        }

        for (Skill s : required) {
            if (studentSkillIds.contains(s.getId())) {
                matched.add(s.getName());
            } else {
                missing.add(s.getName());
            }
        }

        double matchPct = ((double) matched.size() / required.size()) * 100.0;
        matchPct = Math.round(matchPct * 10.0) / 10.0;

        return JobMatchDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .description(job.getDescription())
                .salary(job.getSalary())
                .jobType(job.getJobType())
                .remote(job.isRemote())
                .postedDate(job.getPostedDate())
                .applyUrl(job.getApplyUrl())
                .matchPercentage(matchPct)
                .matchedSkills(matched)
                .missingSkills(missing)
                .saved(isSaved)
                .build();
    }

    @Transactional
    public boolean toggleSaveJob(Long jobId) {
        User user = authService.getCurrentAuthenticatedUser();
        JobPosting job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

        Optional<SavedJob> existing = savedJobRepository.findByUserIdAndJobId(user.getId(), jobId);
        if (existing.isPresent()) {
            savedJobRepository.delete(existing.get());
            return false; // un-saved
        } else {
            savedJobRepository.save(SavedJob.builder()
                    .user(user)
                    .job(job)
                    .build());
            return true; // saved
        }
    }

    public List<JobMatchDto> getSavedJobsForStudent() {
        StudentProfile profile = studentProfileService.getCurrentStudentProfile();
        User user = profile.getUser();

        Set<Long> studentSkillIds = profile.getSkills().stream()
                .map(ss -> ss.getSkill().getId())
                .collect(Collectors.toSet());

        List<SavedJob> savedList = savedJobRepository.findByUserIdOrderBySavedAtDesc(user.getId());
        return savedList.stream()
                .map(sj -> calculateJobMatch(sj.getJob(), studentSkillIds, true))
                .collect(Collectors.toList());
    }

    @Transactional
    public JobPostingDto createJob(JobFormRequest request) {
        if (jobRepository.existsByTitleIgnoreCaseAndCompanyIgnoreCase(request.getTitle().trim(), request.getCompany().trim())) {
            throw new BadRequestException("Job posting for '" + request.getTitle() + "' at '" + request.getCompany() + "' already exists");
        }

        Set<Skill> skills = new HashSet<>();
        if (request.getSkillIds() != null) {
            skills.addAll(skillRepository.findAllById(request.getSkillIds()));
        }

        JobPosting job = JobPosting.builder()
                .title(request.getTitle().trim())
                .company(request.getCompany().trim())
                .location(request.getLocation().trim())
                .description(request.getDescription())
                .salary(request.getSalary())
                .jobType(request.getJobType() != null ? request.getJobType() : "FULL_TIME")
                .remote(request.isRemote())
                .postedDate(request.getPostedDate() != null ? request.getPostedDate() : LocalDate.now())
                .source(request.getSource() != null ? request.getSource() : "DIRECT")
                .applyUrl(request.getApplyUrl().trim())
                .requiredSkills(skills)
                .build();

        return mapToDto(jobRepository.save(job));
    }

    @Transactional
    public void deleteJob(Long id) {
        JobPosting job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));
        jobRepository.delete(job);
    }

    public JobPostingDto mapToDto(JobPosting job) {
        List<SkillDto> skillDtos = job.getRequiredSkills().stream()
                .map(s -> SkillDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .categoryId(s.getCategory().getId())
                        .categoryName(s.getCategory().getName())
                        .difficulty(s.getDifficulty())
                        .demandLevel(s.getDemandLevel())
                        .build()
                ).collect(Collectors.toList());

        return JobPostingDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .company(job.getCompany())
                .location(job.getLocation())
                .description(job.getDescription())
                .salary(job.getSalary())
                .jobType(job.getJobType())
                .remote(job.isRemote())
                .postedDate(job.getPostedDate())
                .source(job.getSource())
                .applyUrl(job.getApplyUrl())
                .requiredSkills(skillDtos)
                .build();
    }
}
