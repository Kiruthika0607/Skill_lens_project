package com.skilllens.assessment;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;
import java.util.*;
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    List<AssessmentAttempt> findByUserIdAndAssessmentId(Long userId, Long assessmentId);
    List<AssessmentAttempt> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<AssessmentAttempt> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable p);
    @Query("SELECT a FROM AssessmentAttempt a WHERE a.userId=:uid AND a.assessmentId=:aid AND a.status='IN_PROGRESS'")
    Optional<AssessmentAttempt> findActiveAttempt(@Param("uid") Long uid, @Param("aid") Long aid);
}
