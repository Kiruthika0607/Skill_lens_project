package com.skilllens.assessment;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="assessment_options")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssessmentOption {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="question_id", nullable=false) private Long questionId;
    @Column(nullable=false, columnDefinition="TEXT") private String optionText;
    @Column(name="is_correct", nullable=false) @Builder.Default private boolean correct = false;
    @Column(name="order_index") @Builder.Default private int orderIndex = 0;
}
