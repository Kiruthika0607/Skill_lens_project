package com.skilllens.assessment;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.Instant;
import java.util.*;

@Entity @Table(name="assessments")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Assessment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=200) private String title;
    @Column(columnDefinition="TEXT") private String description;
    @Column(name="skill_id") private Long skillId;
    @Enumerated(EnumType.STRING) @Column(name="difficulty", length=20) private Difficulty difficulty;
    @Column(name="time_limit_minutes") private Integer timeLimitMinutes;
    @Column(name="passing_score") private Integer passingScore;
    @Column(name="is_active", nullable=false) @Builder.Default private boolean active = true;
    @CreatedDate @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;
    @LastModifiedDate @Column(name="updated_at") private Instant updatedAt;
    public enum Difficulty { BEGINNER, INTERMEDIATE, ADVANCED }
}
