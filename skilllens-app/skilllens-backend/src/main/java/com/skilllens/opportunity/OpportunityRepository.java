package com.skilllens.opportunity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {

    @Query("SELECT o FROM Opportunity o WHERE o.isActive = true AND " +
           "(:type IS NULL OR o.opportunityType = :type) AND " +
           "(:isRemote IS NULL OR o.isRemote = :isRemote) AND " +
           "(:location IS NULL OR LOWER(o.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:deadlineAfter IS NULL OR o.deadline IS NULL OR o.deadline >= :deadlineAfter) AND " +
           "(:search IS NULL OR LOWER(o.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.organization) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Opportunity> searchOpportunities(
            @Param("type") OpportunityType type,
            @Param("isRemote") Boolean isRemote,
            @Param("location") String location,
            @Param("deadlineAfter") Instant deadlineAfter,
            @Param("search") String search,
            Pageable pageable);

    List<Opportunity> findByIsActiveTrue();

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Opportunity o SET o.isActive = false WHERE o.isActive = true AND o.deadline IS NOT NULL AND o.deadline < :now")
    int deactivateExpiredOpportunities(@Param("now") Instant now);
}
