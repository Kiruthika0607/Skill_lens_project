package com.skilllens.career;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="career_required_skills", indexes={
    @Index(name="idx_crs_career",columnList="career_id"),
    @Index(name="idx_crs_skill",columnList="skill_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CareerRequiredSkill {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="career_id", nullable=false) private Long careerId;
    @Column(name="skill_id", nullable=false) private Long skillId;
    @Column(name="min_proficiency", nullable=false) private int minProficiency;
    @Column(name="weight", nullable=false) @Builder.Default private double weight = 1.0;
    @Column(name="is_required", nullable=false) @Builder.Default private boolean required = true;
}
