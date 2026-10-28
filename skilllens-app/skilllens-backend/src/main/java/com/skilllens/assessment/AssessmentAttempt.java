package com.skilllens.assessment;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.Instant;

@Entity @Table(name="assessment_attempts", indexes={
    @Index(name="idx_attempt_user",columnList="user_id"),
    @Index(name="idx_attempt_assessment",columnList="assessment_id")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssessmentAttempt {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="user_id", nullable=false) private Long userId;
    @Column(name="assessment_id", nullable=false) private Long assessmentId;
    @Enumerated(EnumType.STRING) @Column(name="status", length=20, columnDefinition="VARCHAR(20)") @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;
    @Column(name="started_at") private Instant startedAt;
    @Column(name="submitted_at") private Instant submittedAt;
    @Column(name="score") private Integer score;
    @Column(name="max_score") private Integer maxScore;
    @Column(name="passed") private Boolean passed;
    @Column(name="assessed_proficiency") private Integer assessedProficiency;
    @CreatedDate @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;
    public enum AttemptStatus { IN_PROGRESS, SUBMITTED, SCORED, EXPIRED }
}
