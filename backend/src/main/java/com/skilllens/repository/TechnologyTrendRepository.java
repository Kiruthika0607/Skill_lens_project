package com.skilllens.repository;

import com.skilllens.entity.TechnologyTrend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnologyTrendRepository extends JpaRepository<TechnologyTrend, Long> {
    Optional<TechnologyTrend> findBySkillId(Long skillId);
    List<TechnologyTrend> findTop10ByOrderByDemandPercentageDesc();
    List<TechnologyTrend> findByTrendDirection(String trendDirection);
}
