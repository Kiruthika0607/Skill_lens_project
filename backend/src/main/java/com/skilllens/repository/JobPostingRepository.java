package com.skilllens.repository;

import com.skilllens.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    boolean existsByTitleIgnoreCaseAndCompanyIgnoreCase(String title, String company);

    @Query("SELECT j FROM JobPosting j WHERE " +
            "(:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:remote IS NULL OR j.remote = :remote) AND " +
            "(:jobType IS NULL OR j.jobType = :jobType)")
    Page<JobPosting> searchJobs(
            @Param("search") String search,
            @Param("remote") Boolean remote,
            @Param("jobType") String jobType,
            Pageable pageable
    );

    @Query("SELECT COUNT(j) FROM JobPosting j JOIN j.requiredSkills s WHERE s.id = :skillId")
    long countJobsBySkillId(@Param("skillId") Long skillId);

    @Query("SELECT j.location, COUNT(j) FROM JobPosting j GROUP BY j.location ORDER BY COUNT(j) DESC")
    List<Object[]> getLocationDistribution();

    @Query("SELECT j.jobType, COUNT(j) FROM JobPosting j GROUP BY j.jobType")
    List<Object[]> getJobTypeDistribution();

    long countByRemote(boolean remote);
}
