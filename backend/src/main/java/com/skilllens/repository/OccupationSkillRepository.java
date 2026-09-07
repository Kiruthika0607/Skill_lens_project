package com.skilllens.repository;

import com.skilllens.entity.OccupationSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OccupationSkillRepository extends JpaRepository<OccupationSkill, Long> {
    List<OccupationSkill> findByOccupationId(Long occupationId);
    Optional<OccupationSkill> findByOccupationIdAndSkillId(Long occupationId, Long skillId);
    void deleteByOccupationIdAndSkillId(Long occupationId, Long skillId);
}
