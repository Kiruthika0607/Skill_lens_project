package com.skilllens.service;

import com.skilllens.dto.SkillCategoryDto;
import com.skilllens.dto.SkillDto;
import com.skilllens.dto.SkillFormRequest;
import com.skilllens.entity.Skill;
import com.skilllens.entity.SkillAlias;
import com.skilllens.entity.SkillCategory;
import com.skilllens.exception.BadRequestException;
import com.skilllens.exception.ResourceNotFoundException;
import com.skilllens.repository.SkillAliasRepository;
import com.skilllens.repository.SkillCategoryRepository;
import com.skilllens.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final SkillCategoryRepository categoryRepository;
    private final SkillAliasRepository aliasRepository;

    public List<SkillCategoryDto> getAllCategoriesWithSkills() {
        List<SkillCategory> categories = categoryRepository.findAll();
        return categories.stream().map(cat -> {
            List<SkillDto> skills = skillRepository.findByCategoryId(cat.getId()).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
            return SkillCategoryDto.builder()
                    .id(cat.getId())
                    .name(cat.getName())
                    .description(cat.getDescription())
                    .skills(skills)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SkillDto> searchSkills(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllSkills();
        }
        return skillRepository.searchSkills(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Skill getSkillById(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + id));
    }

    /**
     * Deterministic Skill Normalization
     * Normalizes inputs like "js", "JavaScript", "Java Script", "ML", "Machine Learning"
     * into their canonical master record in MySQL.
     */
    public Skill normalizeAndResolveSkill(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new BadRequestException("Skill input cannot be empty");
        }
        String clean = input.trim();

        // 1. Direct match on canonical skill name (case-insensitive)
        Optional<Skill> directMatch = skillRepository.findByNameIgnoreCase(clean);
        if (directMatch.isPresent()) {
            return directMatch.get();
        }

        // 2. Check alias master table
        Optional<SkillAlias> aliasMatch = aliasRepository.findByAliasNameIgnoreCase(clean);
        if (aliasMatch.isPresent()) {
            return aliasMatch.get().getCanonicalSkill();
        }

        // 3. Check normalized alphanumeric representation (strip spaces & dashes)
        String alphanumeric = clean.replaceAll("[^a-zA-Z0-9]", "");
        Optional<SkillAlias> alphaAlias = aliasRepository.findByAliasNameIgnoreCase(alphanumeric);
        if (alphaAlias.isPresent()) {
            return alphaAlias.get().getCanonicalSkill();
        }

        // 4. Fuzzy fallback search on skills
        List<Skill> partialMatches = skillRepository.searchSkills(clean);
        if (!partialMatches.isEmpty()) {
            return partialMatches.get(0);
        }

        throw new ResourceNotFoundException("Skill '" + clean + "' is not recognized in industry taxonomy. Please select from canonical skills list.");
    }

    @Transactional
    public SkillDto createSkill(SkillFormRequest request) {
        if (skillRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Skill with name '" + request.getName() + "' already exists");
        }

        SkillCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Skill skill = Skill.builder()
                .name(request.getName().trim())
                .category(category)
                .description(request.getDescription())
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "INTERMEDIATE")
                .demandLevel(request.getDemandLevel() != null ? request.getDemandLevel() : "MEDIUM")
                .build();

        Skill savedSkill = skillRepository.save(skill);

        if (request.getAliases() != null) {
            for (String alias : request.getAliases()) {
                if (alias != null && !alias.trim().isEmpty() && !aliasRepository.existsByAliasNameIgnoreCase(alias.trim())) {
                    aliasRepository.save(SkillAlias.builder()
                            .aliasName(alias.trim())
                            .canonicalSkill(savedSkill)
                            .build());
                }
            }
        }

        return mapToDto(savedSkill);
    }

    @Transactional
    public SkillDto updateSkill(Long id, SkillFormRequest request) {
        Skill skill = getSkillById(id);

        if (!skill.getName().equalsIgnoreCase(request.getName().trim()) &&
                skillRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Skill with name '" + request.getName() + "' already exists");
        }

        SkillCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        skill.setName(request.getName().trim());
        skill.setCategory(category);
        skill.setDescription(request.getDescription());
        if (request.getDifficulty() != null) skill.setDifficulty(request.getDifficulty());
        if (request.getDemandLevel() != null) skill.setDemandLevel(request.getDemandLevel());

        return mapToDto(skillRepository.save(skill));
    }

    @Transactional
    public void deleteSkill(Long id) {
        Skill skill = getSkillById(id);
        skillRepository.delete(skill);
    }

    public SkillDto mapToDto(Skill skill) {
        return SkillDto.builder()
                .id(skill.getId())
                .name(skill.getName())
                .categoryId(skill.getCategory().getId())
                .categoryName(skill.getCategory().getName())
                .description(skill.getDescription())
                .difficulty(skill.getDifficulty())
                .demandLevel(skill.getDemandLevel())
                .build();
    }
}
