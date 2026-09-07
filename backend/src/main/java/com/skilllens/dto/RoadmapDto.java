package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapDto {
    private Long id;
    private Long occupationId;
    private String occupationTitle;
    private BigDecimal overallProgress;
    private int completedCount;
    private int totalCount;
    private List<RoadmapItemDto> items;
}
