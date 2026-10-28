package com.skilllens.career;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.Instant;

@Entity @Table(name="career_recommendations", indexes={@Index(name="idx_cr_user",columnList="user_id")})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CareerRecommendation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="user_id", nullable=false) private Long userId;
    @Column(name="career_id", nullable=false) private Long careerId;
    @Column(name="match_score") private double matchScore;
    @Column(name="matched_skill_count") private int matchedSkillCount;
    @Column(name="total_required_skills") private int totalRequiredSkills;
    @Column(name="explanation", columnDefinition="TEXT") private String explanation;
    @CreatedDate @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;
}
