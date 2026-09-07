package com.skilllens.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "job_postings", indexes = {
        @Index(name = "idx_job_title", columnList = "title"),
        @Index(name = "idx_job_location", columnList = "location"),
        @Index(name = "idx_job_date", columnList = "posted_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 150)
    private String company;

    @Column(nullable = false, length = 120)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 80)
    private String salary;

    @Column(name = "job_type", length = 40)
    @Builder.Default
    private String jobType = "FULL_TIME"; // FULL_TIME, INTERNSHIP, CONTRACT

    @Column(name = "is_remote")
    @Builder.Default
    private boolean remote = false;

    @Column(name = "posted_date", nullable = false)
    private LocalDate postedDate;

    @Column(length = 80)
    @Builder.Default
    private String source = "DIRECT";

    @Column(name = "apply_url", nullable = false, length = 500)
    private String applyUrl;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> requiredSkills = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
