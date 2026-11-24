
package com.carmarketplace.repository;

import com.carmarketplace.entity.User;
import com.carmarketplace.entity.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findDistinctByRoles_Name(RoleName name);

    // Müəyyən tarixdən sonra qeydiyyatdan keçən istifadəçilər
    long countByCreatedAtAfter(LocalDateTime dateTime);

    // İki tarix arasında qeydiyyatdan keçən istifadəçilər
    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );
}
