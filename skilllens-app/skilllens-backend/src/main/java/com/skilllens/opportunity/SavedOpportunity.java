package com.skilllens.opportunity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "saved_opportunities", indexes = {
        @Index(name = "idx_so_user", columnList = "user_id"),
        @Index(name = "idx_so_user_opp", columnList = "user_id, opportunity_id", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.SAVED;

    @Column(name = "notes", length = 1000)
    private String notes;

    @CreatedDate
    @Column(name = "saved_at", nullable = false, updatable = false)
    private Instant savedAt;

    @Column(name = "applied_at")
    private Instant appliedAt;
}
