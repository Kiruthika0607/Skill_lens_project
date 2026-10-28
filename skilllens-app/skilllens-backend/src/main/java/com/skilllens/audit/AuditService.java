package com.skilllens.audit;

import com.skilllens.common.dto.PagedResponse;
import com.skilllens.common.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAsync(Long userId, String userEmail, String action, String resourceType, String resourceId, String ipAddress, String userAgent, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to write audit log entry: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditLogResponse> searchAuditLogs(
            Long userId, String action, Instant fromTime, Instant toTime, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.searchAuditLogs(userId, action, fromTime, toTime, pageable);
        return PaginationUtil.toPagedResponse(page.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AuditLogResponse mapToResponse(AuditLog a) {
        return AuditLogResponse.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .userEmail(a.getUserEmail())
                .action(a.getAction())
                .resourceType(a.getResourceType())
                .resourceId(a.getResourceId())
                .ipAddress(a.getIpAddress())
                .userAgent(a.getUserAgent())
                .details(a.getDetails())
                .timestamp(a.getTimestamp())
                .build();
    }
}
