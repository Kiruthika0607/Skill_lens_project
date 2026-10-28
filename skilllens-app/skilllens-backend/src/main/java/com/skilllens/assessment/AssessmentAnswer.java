package com.skilllens.assessment;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="assessment_answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssessmentAnswer {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="attempt_id", nullable=false) private Long attemptId;
    @Column(name="question_id", nullable=false) private Long questionId;
    @Column(name="selected_option_ids", columnDefinition="TEXT") private String selectedOptionIds;
}
