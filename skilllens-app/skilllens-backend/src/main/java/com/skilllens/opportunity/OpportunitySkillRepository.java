package com.skilllens.opportunity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OpportunitySkillRepository extends JpaRepository<OpportunitySkill, Long> {
    List<OpportunitySkill> findByOpportunityId(Long opportunityId);
    void deleteByOpportunityId(Long opportunityId);
}
