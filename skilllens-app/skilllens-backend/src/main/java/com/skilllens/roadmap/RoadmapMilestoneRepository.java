package com.skilllens.roadmap;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoadmapMilestoneRepository extends JpaRepository<RoadmapMilestone, Long> {
    List<RoadmapMilestone> findByRoadmapIdOrderByMilestoneOrderAsc(Long roadmapId);
    Optional<RoadmapMilestone> findByIdAndRoadmapId(Long id, Long roadmapId);
}
