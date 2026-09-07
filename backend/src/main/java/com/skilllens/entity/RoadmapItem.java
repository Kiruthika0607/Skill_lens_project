package com.skilllens.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roadmap_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private CareerRoadmap roadmap;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "phase_number", nullable = false)
    private Integer phaseNumber; // 1 = Foundations, 2 = Core, 3 = Advanced, 4 = Production

    @Column(name = "priority_level", length = 20)
    @Builder.Default
    private String priorityLevel = "HIGH";

    @Column(length = 30)
    @Builder.Default
    private String status = "NOT_STARTED"; // NOT_STARTED, IN_PROGRESS, COMPLETED

    @Column(name = "recommended_resource", length = 255)
    private String recommendedResource;
}
