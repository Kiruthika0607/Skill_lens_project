package com.skilllens.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "occupation_skills", uniqueConstraints = {
        @UniqueConstraint(name = "uq_occ_skill", columnNames = {"occupation_id", "skill_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OccupationSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occupation_id", nullable = false)
    private Occupation occupation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(precision = 3, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal weight = BigDecimal.valueOf(1.0); // e.g. 1.0 (optional) to 2.0 (required)

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private boolean required = true;

    @Column(name = "priority_level", length = 20)
    @Builder.Default
    private String priorityLevel = "HIGH"; // HIGH, MEDIUM, LOW
}
