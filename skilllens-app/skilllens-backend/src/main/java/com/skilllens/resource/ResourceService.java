package com.skilllens.resource;

import com.skilllens.common.dto.PagedResponse;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.common.util.PaginationUtil;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final LearningResourceRepository resourceRepository;
    private final SkillRepository skillRepository;
    private final SavedResourceRepository savedResourceRepository;
    private final com.skilllens.skill.StudentSkillRepository studentSkillRepository;

    @Transactional(readOnly = true)
    public List<ResourceResponse> getRecommendedResources(com.skilllens.security.UserPrincipal principal) {
        List<com.skilllens.skill.StudentSkill> skills = studentSkillRepository.findByUserId(principal.getId());

        List<Long> targetSkills = skills.stream()
                .filter(s -> s.getAssessedProficiency() == null || s.getAssessedProficiency() < 3)
                .map(s -> s.getSkill().getId())
                .limit(5)
                .toList();

        List<ResourceResponse> results = new java.util.ArrayList<>();
        for (Long sId : targetSkills) {
            results.addAll(getResourcesBySkill(sId));
            if (results.size() >= 10) break;
        }

        if (results.isEmpty()) {
            results = resourceRepository.findAll(org.springframework.data.domain.PageRequest.of(0, 10))
                    .map(this::mapToResponse)
                    .getContent();
        }
        return results;
    }

    @Transactional
    public SavedResource saveResource(com.skilllens.security.UserPrincipal principal, Long resourceId) {
        LearningResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        return savedResourceRepository.findByUserIdAndResourceId(principal.getId(), resourceId)
                .orElseGet(() -> savedResourceRepository.save(SavedResource.builder()
                        .userId(principal.getId())
                        .resource(resource)
                        .progressPercent(0)
                        .isCompleted(false)
                        .build()));
    }

    @Transactional
    public void unsaveResource(com.skilllens.security.UserPrincipal principal, Long resourceId) {
        savedResourceRepository.findByUserIdAndResourceId(principal.getId(), resourceId)
                .ifPresent(savedResourceRepository::delete);
    }

    @Transactional
    public SavedResource updateProgress(com.skilllens.security.UserPrincipal principal, Long resourceId, int progressPercent) {
        SavedResource saved = savedResourceRepository.findByUserIdAndResourceId(principal.getId(), resourceId)
                .orElseGet(() -> {
                    LearningResource resource = resourceRepository.findById(resourceId)
                            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));
                    return SavedResource.builder()
                            .userId(principal.getId())
                            .resource(resource)
                            .build();
                });

        saved.setProgressPercent(progressPercent);
        if (progressPercent >= 100) {
            saved.setIsCompleted(true);
            saved.setCompletedAt(java.time.Instant.now());
        }
        return savedResourceRepository.save(saved);
    }

    @Transactional(readOnly = true)
    public List<SavedResource> getStudentSavedResources(com.skilllens.security.UserPrincipal principal) {
        return savedResourceRepository.findByUserIdOrderBySavedAtDesc(principal.getId());
    }

    @Transactional(readOnly = true)
    public PagedResponse<ResourceResponse> searchResources(
            Long skillId,
            ResourceType type,
            CostType cost,
            DifficultyLevel difficulty,
            String search,
            Pageable pageable) {

        Page<LearningResource> page = resourceRepository.searchResources(
                skillId, type, cost, difficulty, search, pageable);

        Page<ResourceResponse> responsePage = page.map(this::mapToResponse);
        return PaginationUtil.toPagedResponse(responsePage);
    }

    @Transactional(readOnly = true)
    public ResourceResponse getResource(Long id) {
        LearningResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning resource not found with id: " + id));
        return mapToResponse(resource);
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getResourcesBySkill(Long skillId) {
        return resourceRepository.findBySkillId(skillId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ResourceResponse createResource(CreateResourceRequest request) {
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + request.getSkillId()));

        LearningResource resource = LearningResource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .url(request.getUrl())
                .provider(request.getProvider())
                .resourceType(request.getResourceType())
                .costType(request.getCostType() != null ? request.getCostType() : CostType.FREE)
                .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : DifficultyLevel.BEGINNER)
                .estimatedDurationHours(request.getEstimatedDurationHours())
                .skill(skill)
                .isVerified(true)
                .build();

        resource = resourceRepository.save(resource);
        return mapToResponse(resource);
    }

    @Transactional
    public ResourceResponse updateResource(Long id, CreateResourceRequest request) {
        LearningResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning resource not found with id: " + id));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + request.getSkillId()));

        resource.setTitle(request.getTitle());
        resource.setDescription(request.getDescription());
        resource.setUrl(request.getUrl());
        resource.setProvider(request.getProvider());
        resource.setResourceType(request.getResourceType());
        if (request.getCostType() != null) resource.setCostType(request.getCostType());
        if (request.getDifficultyLevel() != null) resource.setDifficultyLevel(request.getDifficultyLevel());
        resource.setEstimatedDurationHours(request.getEstimatedDurationHours());
        resource.setSkill(skill);

        return mapToResponse(resourceRepository.save(resource));
    }

    @Transactional
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Learning resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    private ResourceResponse mapToResponse(LearningResource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .url(resource.getUrl())
                .provider(resource.getProvider())
                .resourceType(resource.getResourceType())
                .costType(resource.getCostType())
                .difficultyLevel(resource.getDifficultyLevel())
                .estimatedDurationHours(resource.getEstimatedDurationHours())
                .rating(resource.getRating())
                .ratingCount(resource.getRatingCount())
                .skillId(resource.getSkill().getId())
                .skillName(resource.getSkill().getName())
                .isVerified(resource.getIsVerified())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}
