package com.skilllens.skill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface StudentSkillRepository extends JpaRepository<StudentSkill, Long> {

    List<StudentSkill> findByUserId(Long userId);

    Optional<StudentSkill> findByUserIdAndSkillId(Long userId, Long skillId);

    boolean existsByUserIdAndSkillId(Long userId, Long skillId);

    @Modifying
    @Query("UPDATE StudentSkill ss SET ss.assessedProficiency = :level, ss.lastAssessedAt = :ts " +
           "WHERE ss.userId = :userId AND ss.skill.id = :skillId")
    int updateAssessedProficiency(@Param("userId") Long userId,
                                  @Param("skillId") Long skillId,
                                  @Param("level") int level,
                                  @Param("ts") Instant ts);

    @Query("SELECT COUNT(ss) FROM StudentSkill ss WHERE ss.userId = :userId AND ss.assessedProficiency IS NOT NULL")
    long countAssessedSkills(@Param("userId") Long userId);
}
