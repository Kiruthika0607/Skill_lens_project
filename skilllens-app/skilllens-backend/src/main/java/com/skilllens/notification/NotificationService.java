package com.skilllens.notification;

import com.skilllens.common.dto.PagedResponse;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.common.util.PaginationUtil;
import com.skilllens.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(Long userId, String title, String message, NotificationType type, String actionUrl) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .notificationType(type)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getUserNotifications(UserPrincipal principal, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(principal.getId(), pageable);
        return PaginationUtil.toPagedResponse(page.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UserPrincipal principal) {
        return notificationRepository.countByUserIdAndIsReadFalse(principal.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(UserPrincipal principal, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    @Transactional
    public int markAllAsRead(UserPrincipal principal) {
        return notificationRepository.markAllAsReadForUser(principal.getId());
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .title(n.getTitle())
                .message(n.getMessage())
                .notificationType(n.getNotificationType())
                .isRead(n.getIsRead())
                .actionUrl(n.getActionUrl())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
