package com.skilllens.repository;

import com.skilllens.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    @Query("SELECT DISTINCT c FROM Certification c JOIN c.skills s WHERE s.id IN :skillIds")
    List<Certification> findCertificationsBySkillIds(@Param("skillIds") Collection<Long> skillIds);
}
