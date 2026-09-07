package com.skilllens.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skill_aliases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alias_name", nullable = false, unique = true, length = 100)
    private String aliasName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "canonical_skill_id", nullable = false)
    private Skill canonicalSkill;
}
