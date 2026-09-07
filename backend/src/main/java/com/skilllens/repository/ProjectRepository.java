package com.skilllens.repository;

import com.skilllens.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT DISTINCT p FROM Project p JOIN p.skillsCovered s WHERE s.id IN :skillIds")
    List<Project> findProjectsBySkillIds(@Param("skillIds") Collection<Long> skillIds);
}
