package com.skilllens.student;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Student profile — personal, academic, and career preference information.
 */
@Entity
@Table(name = "student_profiles", indexes = {
        @Index(name = "idx_sp_user", columnList = "user_id", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    // ─── Academic ─────────────────────────────────────────────────────────────
    @Column(name = "institution", length = 255)
    private String institution;

    @Column(name = "degree", length = 100)
    private String degree;

    @Column(name = "department", length = 200)
    private String department;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "gpa", precision = 4, scale = 2)
    private BigDecimal gpa;

    @Column(name = "gpa_scale", precision = 4, scale = 2)
    private BigDecimal gpaScale;

    // ─── Career preferences ───────────────────────────────────────────────────
    @Column(name = "preferred_career_role", length = 200)
    private String preferredCareerRole;

    @Column(name = "preferred_locations", columnDefinition = "TEXT")
    private String preferredLocations;   // JSON array stored as text

    @Column(name = "open_to_remote")
    private Boolean openToRemote;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "linkedin_url", length = 512)
    private String linkedinUrl;

    @Column(name = "github_url", length = 512)
    private String githubUrl;

    @Column(name = "portfolio_url", length = 512)
    private String portfolioUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
