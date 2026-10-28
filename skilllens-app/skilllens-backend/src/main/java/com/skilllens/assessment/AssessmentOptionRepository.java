package com.skilllens.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssessmentOptionRepository extends JpaRepository<AssessmentOption, Long> {
    List<AssessmentOption> findByQuestionIdOrderByOrderIndexAsc(Long questionId);
}
