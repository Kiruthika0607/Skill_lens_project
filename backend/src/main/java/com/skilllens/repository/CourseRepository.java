package com.skilllens.repository;

import com.skilllens.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findBySkillId(Long skillId);
    List<Course> findBySkillIdIn(Collection<Long> skillIds);
}
