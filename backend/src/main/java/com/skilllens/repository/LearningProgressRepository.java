package com.skilllens.repository;

import com.skilllens.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    List<LearningProgress> findByStudentProfileId(Long studentProfileId);
    Optional<LearningProgress> findByStudentProfileIdAndSkillId(Long studentProfileId, Long skillId);
}
