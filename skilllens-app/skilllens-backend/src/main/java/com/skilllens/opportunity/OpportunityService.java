package com.skilllens.opportunity;

import com.skilllens.common.dto.PagedResponse;
import com.skilllens.common.exception.ConflictException;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.common.util.PaginationUtil;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final OpportunitySkillRepository opportunitySkillRepository;
    private final SavedOpportunityRepository savedOpportunityRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public PagedResponse<OpportunityResponse> searchOpportunities(
            UserPrincipal principal,
            OpportunityType type,
            Boolean isRemote,
            String location,
            Instant deadlineAfter,
            String search,
            Pageable pageable) {

        Page<Opportunity> page = opportunityRepository.searchOpportunities(
                type, isRemote, location, deadlineAfter, search, pageable);

        Long userId = principal != null ? principal.getId() : null;
        Page<OpportunityResponse> responsePage = page.map(opp -> mapToResponse(opp, userId));
        return PaginationUtil.toPagedResponse(responsePage);
    }

    @Transactional(readOnly = true)
    public OpportunityResponse getOpportunityById(UserPrincipal principal, Long id) {
        Opportunity opportunity = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));
        Long userId = principal != null ? principal.getId() : null;
        return mapToResponse(opportunity, userId);
    }

    @Transactional(readOnly = true)
    public List<OpportunityMatchResponse> getMatchedOpportunities(UserPrincipal principal, int limit) {
        List<Opportunity> activeOpportunities = opportunityRepository.findByIsActiveTrue();
        if (activeOpportunities.isEmpty()) {
            return List.of();
        }

        // Get student's skills (assessed or resume-identified)
        Set<Long> studentSkillIds = studentSkillRepository.findByUserId(principal.getId())
                .stream()
                .filter(ss -> (ss.getAssessedProficiency() != null && ss.getAssessedProficiency() > 0)
                        || (ss.getSelfReportedProficiency() != null && ss.getSelfReportedProficiency() > 0))
                .map(ss -> ss.getSkill().getId())
                .collect(Collectors.toSet());

        List<OpportunityMatchResponse> matches = new ArrayList<>();

        for (Opportunity opp : activeOpportunities) {
            List<OpportunitySkill> requiredSkills = opp.getRequiredSkills();
            if (requiredSkills == null || requiredSkills.isEmpty()) {
                // If no specific skills required, 100% baseline match
                matches.add(OpportunityMatchResponse.builder()
                        .opportunity(mapToResponse(opp, principal.getId()))
                        .matchPercentage(100.0)
                        .matchedSkillCount(0)
                        .totalRequiredSkillCount(0)
                        .matchedSkillNames(List.of())
                        .missingSkillNames(List.of())
                        .build());
                continue;
            }

            List<String> matchedNames = new ArrayList<>();
            List<String> missingNames = new ArrayList<>();

            for (OpportunitySkill os : requiredSkills) {
                if (studentSkillIds.contains(os.getSkill().getId())) {
                    matchedNames.add(os.getSkill().getName());
                } else {
                    missingNames.add(os.getSkill().getName());
                }
            }

            double matchPercentage = ((double) matchedNames.size() / requiredSkills.size()) * 100.0;

            matches.add(OpportunityMatchResponse.builder()
                    .opportunity(mapToResponse(opp, principal.getId()))
                    .matchPercentage(Math.round(matchPercentage * 10.0) / 10.0)
                    .matchedSkillCount(matchedNames.size())
                    .totalRequiredSkillCount(requiredSkills.size())
                    .matchedSkillNames(matchedNames)
                    .missingSkillNames(missingNames)
                    .build());
        }

        // Sort descending by match percentage
        matches.sort((a, b) -> Double.compare(b.getMatchPercentage(), a.getMatchPercentage()));

        return matches.stream().limit(Math.min(limit, 100)).toList();
    }

    @Transactional
    public SavedOpportunity saveOpportunity(UserPrincipal principal, Long opportunityId, SaveOpportunityRequest request) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + opportunityId));

        if (savedOpportunityRepository.existsByUserIdAndOpportunityId(principal.getId(), opportunityId)) {
            throw new ConflictException("Opportunity already saved");
        }

        SavedOpportunity saved = SavedOpportunity.builder()
                .userId(principal.getId())
                .opportunity(opportunity)
                .status(ApplicationStatus.SAVED)
                .notes(request != null ? request.getNotes() : null)
                .build();

        return savedOpportunityRepository.save(saved);
    }

    @Transactional
    public void unsaveOpportunity(UserPrincipal principal, Long opportunityId) {
        SavedOpportunity saved = savedOpportunityRepository.findByUserIdAndOpportunityId(principal.getId(), opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved opportunity record not found"));
        savedOpportunityRepository.delete(saved);
    }

    @Transactional(readOnly = true)
    public List<OpportunityResponse> getMySavedOpportunities(UserPrincipal principal) {
        return savedOpportunityRepository.findByUserIdOrderBySavedAtDesc(principal.getId())
                .stream()
                .map(so -> {
                    OpportunityResponse resp = mapToResponse(so.getOpportunity(), principal.getId());
                    resp.setIsSaved(true);
                    resp.setApplicationStatus(so.getStatus());
                    return resp;
                })
                .toList();
    }

    @Transactional
    public SavedOpportunity updateApplicationStatus(
            UserPrincipal principal,
            Long opportunityId,
            UpdateOpportunityStatusRequest request) {

        SavedOpportunity saved = savedOpportunityRepository.findByUserIdAndOpportunityId(principal.getId(), opportunityId)
                .orElseGet(() -> {
                    Opportunity opp = opportunityRepository.findById(opportunityId)
                            .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + opportunityId));
                    return SavedOpportunity.builder()
                            .userId(principal.getId())
                            .opportunity(opp)
                            .build();
                });

        saved.setStatus(request.getStatus());
        if (request.getStatus() == ApplicationStatus.APPLIED && saved.getAppliedAt() == null) {
            saved.setAppliedAt(Instant.now());
        }
        if (request.getNotes() != null) {
            saved.setNotes(request.getNotes());
        }

        return savedOpportunityRepository.save(saved);
    }

    @Transactional
    public OpportunityResponse createOpportunity(CreateOpportunityRequest request) {
        Opportunity opportunity = Opportunity.builder()
                .title(request.getTitle())
                .organization(request.getOrganization())
                .opportunityType(request.getOpportunityType())
                .location(request.getLocation())
                .isRemote(request.getIsRemote() != null ? request.getIsRemote() : false)
                .employmentType(request.getEmploymentType())
                .experienceLevel(request.getExperienceLevel())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .stipend(request.getStipend())
                .applicationUrl(request.getApplicationUrl())
                .deadline(request.getDeadline())
                .description(request.getDescription())
                .requirementsText(request.getRequirementsText())
                .source(request.getSource())
                .isActive(true)
                .build();

        opportunity = opportunityRepository.save(opportunity);

        if (request.getRequiredSkillIds() != null && !request.getRequiredSkillIds().isEmpty()) {
            List<OpportunitySkill> skillEntities = new ArrayList<>();
            for (Long skillId : request.getRequiredSkillIds()) {
                Skill skill = skillRepository.findById(skillId).orElse(null);
                if (skill != null) {
                    skillEntities.add(OpportunitySkill.builder()
                            .opportunity(opportunity)
                            .skill(skill)
                            .isRequired(true)
                            .minProficiency(1)
                            .build());
                }
            }
            opportunitySkillRepository.saveAll(skillEntities);
            opportunity.setRequiredSkills(skillEntities);
        }

        return mapToResponse(opportunity, null);
    }

    @Transactional
    public void deleteOpportunity(Long id) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with id: " + id));
        opp.setIsActive(false);
        opportunityRepository.save(opp);
    }

    private OpportunityResponse mapToResponse(Opportunity opp, Long userId) {
        List<OpportunitySkillDto> skillDtos = opp.getRequiredSkills() != null
                ? opp.getRequiredSkills().stream()
                .map(os -> OpportunitySkillDto.builder()
                        .skillId(os.getSkill().getId())
                        .skillName(os.getSkill().getName())
                        .isRequired(os.getIsRequired())
                        .minProficiency(os.getMinProficiency())
                        .build())
                .toList()
                : List.of();

        boolean isSaved = false;
        ApplicationStatus appStatus = null;
        if (userId != null) {
            Optional<SavedOpportunity> saved = savedOpportunityRepository.findByUserIdAndOpportunityId(userId, opp.getId());
            if (saved.isPresent()) {
                isSaved = true;
                appStatus = saved.get().getStatus();
            }
        }

        return OpportunityResponse.builder()
                .id(opp.getId())
                .title(opp.getTitle())
                .organization(opp.getOrganization())
                .opportunityType(opp.getOpportunityType())
                .location(opp.getLocation())
                .isRemote(opp.getIsRemote())
                .employmentType(opp.getEmploymentType())
                .experienceLevel(opp.getExperienceLevel())
                .salaryMin(opp.getSalaryMin())
                .salaryMax(opp.getSalaryMax())
                .stipend(opp.getStipend())
                .applicationUrl(opp.getApplicationUrl())
                .deadline(opp.getDeadline())
                .description(opp.getDescription())
                .requirementsText(opp.getRequirementsText())
                .source(opp.getSource())
                .isActive(opp.getIsActive())
                .requiredSkills(skillDtos)
                .isSaved(isSaved)
                .applicationStatus(appStatus)
                .createdAt(opp.getCreatedAt())
                .build();
    }
}
