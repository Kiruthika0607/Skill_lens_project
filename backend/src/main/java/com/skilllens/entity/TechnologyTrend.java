package com.skilllens.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "technology_trends")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnologyTrend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false, unique = true)
    private Skill skill;

    @Column(name = "job_mention_count", nullable = false)
    @Builder.Default
    private Integer jobMentionCount = 0;

    @Column(name = "demand_percentage", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal demandPercentage = BigDecimal.ZERO;

    @Column(name = "trend_direction", length = 20)
    @Builder.Default
    private String trendDirection = "STABLE"; // GROWING, EMERGING, STABLE, DECLINING

    @Column(name = "growth_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal growthRate = BigDecimal.ZERO;

    @UpdateTimestamp
    @Column(name = "last_analyzed")
    private LocalDateTime lastAnalyzed;
}
