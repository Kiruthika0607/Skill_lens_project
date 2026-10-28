package com.skilllens.industry;

import com.skilllens.common.dto.PagedResponse;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.common.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndustryTrendService {

    private final IndustrySkillTrendRepository trendRepository;

    @Transactional(readOnly = true)
    public PagedResponse<IndustryTrendResponse> searchTrends(String sector, Long skillId, Pageable pageable) {
        Page<IndustrySkillTrend> page = trendRepository.searchTrends(sector, skillId, pageable);
        return PaginationUtil.toPagedResponse(page.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public List<IndustryTrendResponse> getTrendsForSkill(Long skillId) {
        return trendRepository.findBySkillId(skillId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<IndustryTrendResponse> getTopInDemand(String sector, int limit) {
        return trendRepository.findTopInDemand(sector, PageRequest.of(0, Math.min(50, limit)))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public IndustryTrendResponse getTrendById(Long id) {
        return trendRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Industry skill trend not found with id: " + id));
    }

    private IndustryTrendResponse mapToResponse(IndustrySkillTrend t) {
        return IndustryTrendResponse.builder()
                .id(t.getId())
                .skillId(t.getSkill().getId())
                .skillName(t.getSkill().getName())
                .skillCategory(t.getSkill().getCategory() != null ? t.getSkill().getCategory().getName() : "General")
                .industrySector(t.getIndustrySector())
                .demandScore(t.getDemandScore())
                .growthRatePercent(t.getGrowthRatePercent())
                .averageSalaryMin(t.getAverageSalaryMin())
                .averageSalaryMax(t.getAverageSalaryMax())
                .jobPostingsCount(t.getJobPostingsCount())
                .topLocations(t.getTopLocations())
                .year(t.getYear())
                .quarter(t.getQuarter())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
