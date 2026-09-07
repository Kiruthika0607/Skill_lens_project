package com.skilllens.service;

import com.skilllens.dto.TrendDto;
import com.skilllens.entity.Skill;
import com.skilllens.entity.TechnologyTrend;
import com.skilllens.repository.JobPostingRepository;
import com.skilllens.repository.SkillRepository;
import com.skilllens.repository.TechnologyTrendRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrendService {

    private final JobPostingRepository jobRepository;
    private final SkillRepository skillRepository;
    private final TechnologyTrendRepository trendRepository;

    /**
     * Compute actual deterministic skill demand percentages from MySQL job postings.
     * Demand = (Count of jobs requiring skill / Total jobs) * 100
     */
    @Transactional
    public List<TrendDto> recalculateAndGetTrends() {
        long totalJobs = jobRepository.count();
        if (totalJobs == 0) {
            return Collections.emptyList();
        }

        List<Skill> allSkills = skillRepository.findAll();
        List<TrendDto> results = new ArrayList<>();

        for (Skill skill : allSkills) {
            long mentionCount = jobRepository.countJobsBySkillId(skill.getId());
            if (mentionCount > 0) {
                BigDecimal demandPct = BigDecimal.valueOf(mentionCount)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalJobs), 2, RoundingMode.HALF_UP);

                String direction = "STABLE";
                BigDecimal growth = BigDecimal.ZERO;

                if (demandPct.compareTo(BigDecimal.valueOf(50.0)) >= 0) {
                    direction = "GROWING";
                    growth = BigDecimal.valueOf(18.5);
                } else if (demandPct.compareTo(BigDecimal.valueOf(25.0)) >= 0) {
                    direction = "EMERGING";
                    growth = BigDecimal.valueOf(28.0);
                } else if (demandPct.compareTo(BigDecimal.valueOf(5.0)) < 0) {
                    direction = "DECLINING";
                    growth = BigDecimal.valueOf(-8.5);
                }

                // Update or create in technology_trends table
                Optional<TechnologyTrend> existing = trendRepository.findBySkillId(skill.getId());
                TechnologyTrend tt = existing.orElseGet(() -> TechnologyTrend.builder()
                        .skill(skill)
                        .build());

                tt.setJobMentionCount((int) mentionCount);
                tt.setDemandPercentage(demandPct);
                tt.setTrendDirection(direction);
                tt.setGrowthRate(growth);
                tt.setLastAnalyzed(LocalDateTime.now());
                trendRepository.save(tt);

                results.add(TrendDto.builder()
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .categoryName(skill.getCategory().getName())
                        .jobMentionCount((int) mentionCount)
                        .demandPercentage(demandPct)
                        .trendDirection(direction)
                        .growthRate(growth)
                        .build());
            }
        }

        // Sort descending by demand percentage
        results.sort((a, b) -> b.getDemandPercentage().compareTo(a.getDemandPercentage()));
        return results;
    }

    public List<TrendDto> getTopDemandedSkills(int limit) {
        List<TrendDto> trends = recalculateAndGetTrends();
        return trends.stream().limit(limit).collect(Collectors.toList());
    }

    public List<TrendDto> getTrendsByDirection(String direction) {
        List<TrendDto> trends = recalculateAndGetTrends();
        return trends.stream()
                .filter(t -> t.getTrendDirection().equalsIgnoreCase(direction))
                .collect(Collectors.toList());
    }
}
