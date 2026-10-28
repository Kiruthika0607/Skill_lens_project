package com.skilllens.assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AssessmentAnswerRepository extends JpaRepository<AssessmentAnswer, Long> {
    List<AssessmentAnswer> findByAttemptId(Long attemptId);
}
