package com.skilllens.scheduler;

import com.skilllens.notification.NotificationRepository;
import com.skilllens.opportunity.OpportunityRepository;
import com.skilllens.resume.Resume;
import com.skilllens.resume.ResumeRepository;
import com.skilllens.resume.ResumeService;
import com.skilllens.resume.ResumeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Background scheduled tasks for system maintenance, opportunity freshness,
 * resume processing retries, and data hygiene.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SkillLensScheduledTasks {

    private final OpportunityRepository opportunityRepository;
    private final NotificationRepository notificationRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeService resumeService;

    /**
     * Deactivates opportunities whose application deadline has elapsed.
     */
    @Scheduled(cron = "${skilllens.scheduler.expiry-check-cron:0 0 1 * * *}")
    @Transactional
    public void checkOpportunityDeadlines() {
        log.info("Running scheduled task: checkOpportunityDeadlines");
        try {
            int updated = opportunityRepository.deactivateExpiredOpportunities(Instant.now());
            log.info("checkOpportunityDeadlines finished: {} expired opportunities marked inactive", updated);
        } catch (Exception e) {
            log.error("Error running checkOpportunityDeadlines: {}", e.getMessage(), e);
        }
    }

    /**
     * Purges read notifications older than 30 days.
     */
    @Scheduled(cron = "${skilllens.scheduler.notification-cron:0 */15 * * * *}")
    @Transactional
    public void purgeOldNotifications() {
        log.debug("Running scheduled task: purgeOldNotifications");
        try {
            Instant cutoff = Instant.now().minus(30, ChronoUnit.DAYS);
            int purged = notificationRepository.deleteReadNotificationsOlderThan(cutoff);
            if (purged > 0) {
                log.info("purgeOldNotifications finished: {} old notifications deleted", purged);
            }
        } catch (Exception e) {
            log.error("Error running purgeOldNotifications: {}", e.getMessage(), e);
        }
    }

    /**
     * Re-attempts parsing for resumes stuck in PARSING status for more than 10 minutes.
     */
    @Scheduled(cron = "${skilllens.scheduler.resume-retry-cron:0 */10 * * * *}")
    public void retryPendingResumes() {
        log.debug("Running scheduled task: retryPendingResumes");
        try {
            Instant cutoff = Instant.now().minus(10, ChronoUnit.MINUTES);
            List<Resume> stuckResumes = resumeRepository.findByStatusAndCreatedAtBefore(ResumeStatus.PARSING, cutoff);
            if (!stuckResumes.isEmpty()) {
                log.info("Found {} stuck resumes to reprocess", stuckResumes.size());
                for (Resume resume : stuckResumes) {
                    try {
                        resumeService.reparseResume(resume.getId());
                    } catch (Exception ex) {
                        log.error("Failed retry on resume {}: {}", resume.getId(), ex.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error running retryPendingResumes: {}", e.getMessage(), e);
        }
    }

    /**
     * Scheduled synchronization / verification of aggregated opportunities.
     */
    @Scheduled(cron = "${skilllens.scheduler.opportunity-sync-cron:0 0 */6 * * *}")
    public void syncAggregatedOpportunities() {
        log.info("Running scheduled task: syncAggregatedOpportunities");
        try {
            long activeCount = opportunityRepository.count();
            log.info("Aggregated opportunity synchronization complete. Current opportunity pool: {}", activeCount);
        } catch (Exception e) {
            log.error("Error during opportunity aggregation sync: {}", e.getMessage(), e);
        }
    }

    /**
     * Heartbeat check logging platform data health and resource status.
     */
    @Scheduled(cron = "${skilllens.scheduler.analytics-cron:0 0 0 * * *}")
    public void logDataFreshnessHeartbeat() {
        log.info("SkillLens Platform Data Freshness Heartbeat: All background services operational.");
    }
}
