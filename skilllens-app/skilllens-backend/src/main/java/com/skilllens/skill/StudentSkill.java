package com.skilllens.skill;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * A student's skill record — stores both self-reported and assessment-based proficiency.
 * <p>
 * Proficiency scale:
 *   0 = Not demonstrated
 *   1 = Beginner
 *   2 = Basic
 *   3 = Intermediate
 *   4 = Advanced
 */
@Entity
@Table(name = "student_skills", indexes = {
        @Index(name = "idx_ss_user", columnList = "user_id"),
        @Index(name = "idx_ss_user_skill", columnList = "user_id, skill_id", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    /**
     * Self-reported proficiency (0–4). Null if the student has not self-reported.
     */
    @Column(name = "self_reported_proficiency")
    private Integer selfReportedProficiency;

    /**
     * Assessment-based proficiency (0–4). Null if the student has not been assessed.
     * Never auto-derived from self-reported; only set by the assessment engine.
     */
    @Column(name = "assessed_proficiency")
    private Integer assessedProficiency;

    @Column(name = "last_assessed_at")
    private Instant lastAssessedAt;

    @Column(name = "notes", length = 500)
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
