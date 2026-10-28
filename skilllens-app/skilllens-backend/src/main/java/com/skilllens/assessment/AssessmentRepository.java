package com.skilllens.assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.*;
import java.util.*;
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    Page<Assessment> findByActiveTrue(Pageable p);
    List<Assessment> findBySkillIdAndActiveTrue(Long skillId);
    Optional<Assessment> findByTitle(String title);
}
