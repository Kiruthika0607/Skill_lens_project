package com.skilllens.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:fromTime IS NULL OR a.timestamp >= :fromTime) AND " +
           "(:toTime IS NULL OR a.timestamp <= :toTime) " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> searchAuditLogs(
            @Param("userId") Long userId,
            @Param("action") String action,
            @Param("fromTime") Instant fromTime,
            @Param("toTime") Instant toTime,
            Pageable pageable);

    List<AuditLog> findTop50ByOrderByTimestampDesc();
}
