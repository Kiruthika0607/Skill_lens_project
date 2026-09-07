package com.skilllens.repository;

import com.skilllens.entity.Occupation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OccupationRepository extends JpaRepository<Occupation, Long> {
    Optional<Occupation> findByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCase(String title);
}
