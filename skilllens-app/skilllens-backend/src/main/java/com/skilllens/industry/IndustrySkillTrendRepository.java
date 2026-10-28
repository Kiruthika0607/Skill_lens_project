package com.skilllens.industry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IndustrySkillTrendRepository extends JpaRepository<IndustrySkillTrend, Long> {

    List<IndustrySkillTrend> findBySkillId(Long skillId);

    Optional<IndustrySkillTrend> findTopBySkillIdOrderByYearDescQuarterDesc(Long skillId);

    @Query("SELECT t FROM IndustrySkillTrend t WHERE " +
           "(:sector IS NULL OR LOWER(t.industrySector) = LOWER(:sector)) " +
           "ORDER BY t.demandScore DESC")
    List<IndustrySkillTrend> findTopInDemand(@Param("sector") String sector, Pageable pageable);

    @Query("SELECT t FROM IndustrySkillTrend t WHERE " +
           "(:sector IS NULL OR LOWER(t.industrySector) LIKE LOWER(CONCAT('%', :sector, '%'))) AND " +
           "(:skillId IS NULL OR t.skill.id = :skillId)")
    Page<IndustrySkillTrend> searchTrends(
            @Param("sector") String sector,
            @Param("skillId") Long skillId,
            Pageable pageable);
}
