package com.skilllens.service;

import com.skilllens.dto.RoadmapDto;
import com.skilllens.dto.RoadmapItemDto;
import com.skilllens.entity.*;
import com.skilllens.exception.ResourceNotFoundException;
import com.skilllens.repository.CareerRoadmapRepository;
import com.skilllens.repository.OccupationRepository;
import com.skilllens.repository.RoadmapItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final CareerRoadmapRepository roadmapRepository;
    private final RoadmapItemRepository roadmapItemRepository;
    private final OccupationRepository occupationRepository;
    private final StudentProfileService studentProfileService;

    @Transactional
    public RoadmapDto getOrCreateRoadmapForCurrentStudent(Long occupationId) {
        StudentProfile profile = studentProfileService.getCurrentStudentProfile();

        Occupation occupation;
        if (occupationId != null) {
            occupation = occupationRepository.findById(occupationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Occupation not found with ID: " + occupationId));
        } else if (profile.getTargetOccupationId() != null) {
            occupation = occupationRepository.findById(profile.getTargetOccupationId()).orElse(null);
            if (occupation == null) {
                occupation = getFirstAvailableOccupation();
            }
        } else {
            occupation = getFirstAvailableOccupation();
        }

        if (occupation == null) {
            return RoadmapDto.builder()
                    .id(null)
                    .occupationId(null)
                    .occupationTitle("No Occupations Available")
                    .overallProgress(BigDecimal.ZERO)
                    .completedCount(0)
                    .totalCount(0)
                    .items(Collections.emptyList())
                    .build();
        }

        Optional<CareerRoadmap> existing = roadmapRepository.findByStudentProfileIdAndOccupationId(profile.getId(), occupation.getId());
        CareerRoadmap roadmap;

        if (existing.isPresent()) {
            roadmap = existing.get();
        } else {
            roadmap = generateRoadmap(profile, occupation);
        }

        return mapToDto(roadmap);
    }

    private CareerRoadmap generateRoadmap(StudentProfile profile, Occupation occupation) {
        Set<Long> studentSkillIds = profile.getSkills().stream()
                .map(ss -> ss.getSkill().getId())
                .collect(Collectors.toSet());

        CareerRoadmap roadmap = CareerRoadmap.builder()
                .studentProfile(profile)
                .occupation(occupation)
                .overallProgress(BigDecimal.ZERO)
                .build();
        roadmap = roadmapRepository.save(roadmap);

        List<OccupationSkill> occupationSkills = new ArrayList<>(occupation.getRequiredSkills());
        occupationSkills.sort(Comparator.comparing(os -> os.getSkill().getId()));

        int totalSkills = occupationSkills.size();
        List<RoadmapItem> items = new ArrayList<>();

        for (int i = 0; i < totalSkills; i++) {
            OccupationSkill os = occupationSkills.get(i);
            Skill skill = os.getSkill();

            // Distribute across 4 sequential phases
            int phaseNumber;
            if (i < Math.max(1, totalSkills / 4)) {
                phaseNumber = 1; // Foundations
            } else if (i < Math.max(2, (totalSkills * 2) / 4)) {
                phaseNumber = 2; // Core
            } else if (i < Math.max(3, (totalSkills * 3) / 4)) {
                phaseNumber = 3; // Advanced
            } else {
                phaseNumber = 4; // Production
            }

            boolean alreadyPossessed = studentSkillIds.contains(skill.getId());
            String status = alreadyPossessed ? "COMPLETED" : "NOT_STARTED";
            String resource = "Curated Course & Project Milestone for " + skill.getName();

            RoadmapItem item = RoadmapItem.builder()
                    .roadmap(roadmap)
                    .skill(skill)
                    .phaseNumber(phaseNumber)
                    .priorityLevel(os.getPriorityLevel() != null ? os.getPriorityLevel() : "HIGH")
                    .status(status)
                    .recommendedResource(resource)
                    .build();

            items.add(roadmapItemRepository.save(item));
        }

        roadmap.setItems(items);
        recalculateRoadmapProgress(roadmap);
        return roadmapRepository.save(roadmap);
    }

    @Transactional
    public RoadmapDto updateItemStatus(Long itemId, String newStatus) {
        RoadmapItem item = roadmapItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap item not found with ID: " + itemId));

        if (!List.of("NOT_STARTED", "IN_PROGRESS", "COMPLETED").contains(newStatus.toUpperCase())) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        item.setStatus(newStatus.toUpperCase());
        roadmapItemRepository.save(item);

        CareerRoadmap roadmap = item.getRoadmap();
        recalculateRoadmapProgress(roadmap);
        return mapToDto(roadmapRepository.save(roadmap));
    }

    private void recalculateRoadmapProgress(CareerRoadmap roadmap) {
        List<RoadmapItem> items = roadmap.getItems();
        if (items == null || items.isEmpty()) {
            roadmap.setOverallProgress(BigDecimal.ZERO);
            return;
        }

        long completed = items.stream().filter(item -> "COMPLETED".equalsIgnoreCase(item.getStatus())).count();
        long inProgress = items.stream().filter(item -> "IN_PROGRESS".equalsIgnoreCase(item.getStatus())).count();

        // Count completed as 1.0 and in-progress as 0.5
        double progressScore = (completed * 1.0) + (inProgress * 0.5);
        BigDecimal progressPct = BigDecimal.valueOf(progressScore)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(items.size()), 1, RoundingMode.HALF_UP);

        roadmap.setOverallProgress(progressPct);
    }

    private Occupation getFirstAvailableOccupation() {
        List<Occupation> all = occupationRepository.findAll();
        return all.isEmpty() ? null : all.get(0);
    }

    private RoadmapDto mapToDto(CareerRoadmap roadmap) {
        List<RoadmapItemDto> itemDtos = roadmap.getItems().stream().map(item -> RoadmapItemDto.builder()
                .id(item.getId())
                .skillId(item.getSkill().getId())
                .skillName(item.getSkill().getName())
                .categoryName(item.getSkill().getCategory().getName())
                .phaseNumber(item.getPhaseNumber())
                .phaseName(getPhaseName(item.getPhaseNumber()))
                .priorityLevel(item.getPriorityLevel())
                .status(item.getStatus())
                .recommendedResource(item.getRecommendedResource())
                .build()
        ).collect(Collectors.toList());

        long completed = itemDtos.stream().filter(i -> "COMPLETED".equalsIgnoreCase(i.getStatus())).count();

        return RoadmapDto.builder()
                .id(roadmap.getId())
                .occupationId(roadmap.getOccupation().getId())
                .occupationTitle(roadmap.getOccupation().getTitle())
                .overallProgress(roadmap.getOverallProgress())
                .completedCount((int) completed)
                .totalCount(itemDtos.size())
                .items(itemDtos)
                .build();
    }

    private String getPhaseName(int phaseNumber) {
        switch (phaseNumber) {
            case 1: return "Phase 1: Engineering Foundations";
            case 2: return "Phase 2: Core Architecture & Tools";
            case 3: return "Phase 3: Advanced Systems & Integration";
            case 4: return "Phase 4: Production & Deployment";
            default: return "Phase " + phaseNumber;
        }
    }
}
