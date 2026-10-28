package com.skilllens.career;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.Instant;

@Entity @Table(name="career_roles")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CareerRole {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=200) private String title;
    @Column(columnDefinition="TEXT") private String description;
    @Column(name="industry", length=100) private String industry;
    @Column(name="avg_salary_range", length=100) private String avgSalaryRange;
    @Column(name="is_active", nullable=false) @Builder.Default private boolean active = true;
    @CreatedDate @Column(name="created_at", nullable=false, updatable=false) private Instant createdAt;
    @LastModifiedDate @Column(name="updated_at") private Instant updatedAt;
}
