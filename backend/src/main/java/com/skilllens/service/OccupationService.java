package com.skilllens.service;

import com.skilllens.dto.OccupationDetailDto;
import com.skilllens.dto.OccupationDto;
import com.skilllens.dto.OccupationFormRequest;
import com.skilllens.dto.OccupationSkillDto;
import com.skilllens.entity.Occupation;
import com.skilllens.entity.OccupationSkill;
import com.skilllens.entity.Skill;
import com.skilllens.exception.BadRequestException;
import com.skilllens.exception.ResourceNotFoundException;
import com.skilllens.repository.OccupationRepository;
import com.skilllens.repository.OccupationSkillRepository;
import com.skilllens.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OccupationService {

    private final OccupationRepository occupationRepository;
    private final OccupationSkillRepository occupationSkillRepository;
    private final SkillRepository skillRepository;

    public List<OccupationDto> getAllOccupations() {
        return occupationRepository.findAll().stream().map(occ -> {
            int reqCount = (int) occ.getRequiredSkills().stream().filter(OccupationSkill::isRequired).count();
            int optCount = occ.getRequiredSkills().size() - reqCount;
            return OccupationDto.builder()
                    .id(occ.getId())
                    .title(occ.getTitle())
                    .description(occ.getDescription())
                    .careerLevel(occ.getCareerLevel())
                    .averageSalary(occ.getAverageSalary())
                    .industryDemand(occ.getIndustryDemand())
                    .requiredSkillCount(reqCount)
                    .optionalSkillCount(optCount)
                    .build();
        }).collect(Collectors.toList());
    }

    public OccupationDetailDto getOccupationDetail(Long id) {
        Occupation occ = occupationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Occupation not found with ID: " + id));

        List<OccupationSkillDto> skills = occ.getRequiredSkills().stream().map(os -> OccupationSkillDto.builder()
                .skillId(os.getSkill().getId())
                .skillName(os.getSkill().getName())
                .categoryName(os.getSkill().getCategory().getName())
                .weight(os.getWeight())
                .required(os.isRequired())
                .priorityLevel(os.getPriorityLevel())
                .build()
        ).collect(Collectors.toList());

        return OccupationDetailDto.builder()
                .id(occ.getId())
                .title(occ.getTitle())
                .description(occ.getDescription())
                .careerLevel(occ.getCareerLevel())
                .averageSalary(occ.getAverageSalary())
                .industryDemand(occ.getIndustryDemand())
                .skills(skills)
                .build();
    }

    public Occupation getOccupationById(Long id) {
        return occupationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Occupation not found with ID: " + id));
    }

    @Transactional
    public OccupationDetailDto createOccupation(OccupationFormRequest request) {
        if (occupationRepository.existsByTitleIgnoreCase(request.getTitle().trim())) {
            throw new BadRequestException("Occupation with title '" + request.getTitle() + "' already exists");
        }

        Occupation occupation = Occupation.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .careerLevel(request.getCareerLevel() != null ? request.getCareerLevel() : "ENTRY_LEVEL")
                .averageSalary(request.getAverageSalary())
                .industryDemand(request.getIndustryDemand() != null ? request.getIndustryDemand() : "HIGH")
                .build();

        Occupation savedOcc = occupationRepository.save(occupation);

        if (request.getSkillRequirements() != null) {
            for (OccupationFormRequest.OccupationSkillRequirement sr : request.getSkillRequirements()) {
                Skill skill = skillRepository.findById(sr.getSkillId())
                        .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + sr.getSkillId()));

                OccupationSkill os = OccupationSkill.builder()
                        .occupation(savedOcc)
                        .skill(skill)
                        .weight(sr.getWeight() != null ? sr.getWeight() : (sr.isRequired() ? BigDecimal.valueOf(2.0) : BigDecimal.valueOf(1.0)))
                        .required(sr.isRequired())
                        .priorityLevel(sr.getPriorityLevel() != null ? sr.getPriorityLevel() : "HIGH")
                        .build();
                occupationSkillRepository.save(os);
                savedOcc.getRequiredSkills().add(os);
            }
        }

        return getOccupationDetail(savedOcc.getId());
    }

    @Transactional
    public void deleteOccupation(Long id) {
        Occupation occ = getOccupationById(id);
        occupationRepository.delete(occ);
    }
}
