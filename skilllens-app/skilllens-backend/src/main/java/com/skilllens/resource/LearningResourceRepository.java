package com.skilllens.resource;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {

    List<LearningResource> findBySkillId(Long skillId);

    Page<LearningResource> findBySkillId(Long skillId, Pageable pageable);

    @Query("SELECT lr FROM LearningResource lr WHERE " +
           "(:skillId IS NULL OR lr.skill.id = :skillId) AND " +
           "(:type IS NULL OR lr.resourceType = :type) AND " +
           "(:cost IS NULL OR lr.costType = :cost) AND " +
           "(:difficulty IS NULL OR lr.difficultyLevel = :difficulty) AND " +
           "(:search IS NULL OR LOWER(lr.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(lr.provider) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<LearningResource> searchResources(
            @Param("skillId") Long skillId,
            @Param("type") ResourceType type,
            @Param("cost") CostType cost,
            @Param("difficulty") DifficultyLevel difficulty,
            @Param("search") String search,
            Pageable pageable);
}
