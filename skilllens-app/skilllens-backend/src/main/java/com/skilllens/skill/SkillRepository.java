package com.skilllens.skill;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    @Query("SELECT s FROM Skill s WHERE s.active = true AND " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Skill> searchSkills(@Param("search") String search, Pageable pageable);

    List<Skill> findByCategoryIdAndActiveTrue(Long categoryId);

    List<Skill> findByActiveTrue();
}
