package com.skilllens.resource;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedResourceRepository extends JpaRepository<SavedResource, Long> {
    List<SavedResource> findByUserIdOrderBySavedAtDesc(Long userId);
    Optional<SavedResource> findByUserIdAndResourceId(Long userId, Long resourceId);
    boolean existsByUserIdAndResourceId(Long userId, Long resourceId);
}
