
package com.carmarketplace.repository;

import com.carmarketplace.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findAllByUser_EmailOrderByCreatedAtDesc(
            String email
    );

    List<Notification> findAllByUser_EmailAndIsReadFalseOrderByCreatedAtDesc(
            String email
    );

    long countByUser_EmailAndIsReadFalse(String email);
}
