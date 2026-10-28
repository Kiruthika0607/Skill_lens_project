package com.skilllens.student;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(Long userId);

    @Query("SELECT sp FROM StudentProfile sp WHERE " +
           "(:search IS NULL OR LOWER(sp.firstName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(sp.lastName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(sp.institution) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<StudentProfile> searchProfiles(@Param("search") String search, Pageable pageable);
}
