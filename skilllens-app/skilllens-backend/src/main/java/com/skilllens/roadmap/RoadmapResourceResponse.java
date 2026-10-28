package com.skilllens.roadmap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapResourceResponse {
    private Long id;
    private String title;
    private String url;
    private Integer progressPercent;
    private boolean completed;
}
