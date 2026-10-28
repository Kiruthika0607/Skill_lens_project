package com.skilllens.assessment;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity @Table(name="assessment_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssessmentQuestion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="assessment_id", nullable=false) private Long assessmentId;
    @Column(nullable=false, columnDefinition="TEXT") private String questionText;
    @Enumerated(EnumType.STRING) @Column(name="question_type", length=30) private QuestionType questionType;
    @Column(name="points", nullable=false) @Builder.Default private int points = 1;
    @Column(name="order_index", nullable=false) @Builder.Default private int orderIndex = 0;
    @OneToMany(cascade=CascadeType.ALL, orphanRemoval=true)
    @JoinColumn(name="question_id", insertable=false, updatable=false)
    @Builder.Default private List<AssessmentOption> options = new ArrayList<>();
    public enum QuestionType { SINGLE_CHOICE, MULTIPLE_CHOICE }
}
