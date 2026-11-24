
package com.carmarketplace.service;

import com.carmarketplace.entity.Notification;
import com.carmarketplace.entity.User;
import com.carmarketplace.entity.enums.RoleName;
import com.carmarketplace.repository.NotificationRepository;
import com.carmarketplace.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Konkret istifadəçiyə bildiriş göndərmək
    public void sendNotification(
            String email,
            String title,
            String message,
            Long carId
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "İstifadəçi tapılmadı: " + email
                        )
                );

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setCarId(carId);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    // Satıcıya bildiriş göndərmək
    public void notifySeller(
            String sellerEmail,
            String title,
            String message,
            Long carId
    ) {
        sendNotification(
                sellerEmail,
                title,
                message,
                carId
        );
    }

    // Bütün adminlərə bildiriş göndərmək
    public void notifyAdmins(
            String title,
            String message,
            Long carId
    ) {
        List<User> admins = userRepository.findDistinctByRoles_Name(
                RoleName.ROLE_ADMIN
        );

        for (User admin : admins) {

            Notification notification = new Notification();
            notification.setUser(admin);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setCarId(carId);
            notification.setRead(false);

            notificationRepository.save(notification);
        }
    }

    // İstifadəçinin bütün bildirişləri
    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(String email) {

        return notificationRepository
                .findAllByUser_EmailOrderByCreatedAtDesc(email);
    }

    // Oxunmamış bildirişlər
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(String email) {

        return notificationRepository
                .findAllByUser_EmailAndIsReadFalseOrderByCreatedAtDesc(
                        email
                );
    }

    // Oxunmamış bildirişlərin sayı
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {

        return notificationRepository
                .countByUser_EmailAndIsReadFalse(email);
    }

    // Bir bildirişi oxunmuş etmək
    public void markAsRead(Long notificationId, String email) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Bildiriş tapılmadı."
                        )
                );

        if (!notification.getUser().getEmail().equals(email)) {
            throw new IllegalArgumentException(
                    "Bu bildirişə giriş icazəniz yoxdur."
            );
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // Bütün bildirişləri oxunmuş etmək
    public void markAllAsRead(String email) {

        List<Notification> notifications =
                notificationRepository
                        .findAllByUser_EmailAndIsReadFalseOrderByCreatedAtDesc(
                                email
                        );

        notifications.forEach(notification ->
                notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }
}
