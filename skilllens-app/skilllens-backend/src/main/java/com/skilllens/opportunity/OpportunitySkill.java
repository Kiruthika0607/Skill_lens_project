package com.skilllens.opportunity;

import com.skilllens.skill.Skill;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "opportunity_skills", indexes = {
        @Index(name = "idx_opp_skill_opp", columnList = "opportunity_id"),
        @Index(name = "idx_opp_skill_skill", columnList = "skill_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpportunitySkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private Boolean isRequired = true;

    @Column(name = "min_proficiency")
    @Builder.Default
    private Integer minProficiency = 1;
}
