package com.skilllens.industry;

import com.skilllens.skill.Skill;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "industry_skill_trends", indexes = {
        @Index(name = "idx_ist_skill", columnList = "skill_id"),
        @Index(name = "idx_ist_sector", columnList = "industry_sector")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndustrySkillTrend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "industry_sector", nullable = false, length = 100)
    private String industrySector;

    @Column(name = "demand_score", nullable = false)
    private Double demandScore; // 0 to 100

    @Column(name = "growth_rate_percent", nullable = false)
    private Double growthRatePercent;

    @Column(name = "average_salary_min")
    private Integer averageSalaryMin;

    @Column(name = "average_salary_max")
    private Integer averageSalaryMax;

    @Column(name = "job_postings_count")
    private Integer jobPostingsCount;

    @Column(name = "top_locations", length = 500)
    private String topLocations;

    @Column(name = "trend_year", nullable = false)
    private Integer year;

    @Column(name = "trend_quarter", length = 10)
    private String quarter;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
