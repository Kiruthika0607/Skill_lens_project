package com.skilllens.career;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CareerRequiredSkillRepository extends JpaRepository<CareerRequiredSkill, Long> {
    List<CareerRequiredSkill> findByCareerId(Long careerId);
    void deleteByCareerId(Long careerId);
}
