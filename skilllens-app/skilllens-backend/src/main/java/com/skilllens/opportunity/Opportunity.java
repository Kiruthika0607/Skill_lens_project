package com.skilllens.opportunity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "opportunities", indexes = {
        @Index(name = "idx_opp_type", columnList = "opportunity_type"),
        @Index(name = "idx_opp_deadline", columnList = "deadline"),
        @Index(name = "idx_opp_active", columnList = "is_active")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "organization", nullable = false, length = 255)
    private String organization;

    @Enumerated(EnumType.STRING)
    @Column(name = "opportunity_type", nullable = false, length = 30)
    private OpportunityType opportunityType;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "is_remote", nullable = false)
    @Builder.Default
    private Boolean isRemote = false;

    @Column(name = "employment_type", length = 50)
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT

    @Column(name = "experience_level", length = 50)
    private String experienceLevel; // ENTRY_LEVEL, MID_LEVEL, INTERNSHIP

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Column(name = "stipend", length = 100)
    private String stipend;

    @Column(name = "application_url", nullable = false, length = 1024)
    private String applicationUrl;

    @Column(name = "deadline")
    private Instant deadline;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "requirements_text", columnDefinition = "TEXT")
    private String requirementsText;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "opportunity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OpportunitySkill> requiredSkills = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
