package com.skilllens.career;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface CareerRecommendationRepository extends JpaRepository<CareerRecommendation, Long> {
    List<CareerRecommendation> findByUserIdOrderByMatchScoreDesc(Long userId);
    @Modifying @Query("DELETE FROM CareerRecommendation cr WHERE cr.userId=:uid")
    void deleteAllForUser(@Param("uid") Long uid);
}
