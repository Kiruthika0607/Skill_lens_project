package com.skilllens.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "occupations", indexes = {
        @Index(name = "idx_occupation_title", columnList = "title")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Occupation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "career_level", length = 30)
    @Builder.Default
    private String careerLevel = "ENTRY_LEVEL";

    @Column(name = "average_salary", length = 60)
    private String averageSalary;

    @Column(name = "industry_demand", length = 30)
    @Builder.Default
    private String industryDemand = "HIGH";

    @OneToMany(mappedBy = "occupation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private Set<OccupationSkill> requiredSkills = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
