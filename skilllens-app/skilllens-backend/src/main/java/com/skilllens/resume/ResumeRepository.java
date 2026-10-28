package com.skilllens.resume;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Resume> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Resume> findByIdAndUserId(Long id, Long userId);
    List<Resume> findByStatusAndCreatedAtBefore(ResumeStatus status, Instant cutoff);
    long countByUserId(Long userId);
}
