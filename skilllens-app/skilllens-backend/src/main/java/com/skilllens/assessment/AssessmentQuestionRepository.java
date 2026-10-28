package com.skilllens.assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {
    List<AssessmentQuestion> findByAssessmentIdOrderByOrderIndexAsc(Long assessmentId);
}
