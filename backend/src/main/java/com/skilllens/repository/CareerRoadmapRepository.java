package com.skilllens.repository;

import com.skilllens.entity.CareerRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerRoadmapRepository extends JpaRepository<CareerRoadmap, Long> {
    Optional<CareerRoadmap> findByStudentProfileIdAndOccupationId(Long studentProfileId, Long occupationId);
    Optional<CareerRoadmap> findFirstByStudentProfileIdOrderByCreatedAtDesc(Long studentProfileId);
}
