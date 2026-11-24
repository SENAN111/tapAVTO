package com.carmarketplace.repository;

import com.carmarketplace.entity.CarEditRequest;
import com.carmarketplace.entity.enums.CarEditRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarEditRequestRepository
        extends JpaRepository<CarEditRequest, Long> {

    // Admin üçün gözləyən redaktə sorğuları
    List<CarEditRequest> findAllByStatusOrderByCreatedAtDesc(
            CarEditRequestStatus status
    );

    // Konkret elanın redaktə sorğuları
    List<CarEditRequest> findAllByCar_IdOrderByCreatedAtDesc(Long carId);

    // Elan üçün gözləyən sorğu olub-olmadığını yoxlamaq
    boolean existsByCar_IdAndStatus(
            Long carId,
            CarEditRequestStatus status
    );

    // İstifadəçinin redaktə sorğuları
    List<CarEditRequest> findAllByRequestedBy_EmailOrderByCreatedAtDesc(
            String email
    );

    // Müəyyən sorğunu elanla birlikdə tapmaq
    Optional<CarEditRequest> findByIdAndCar_Id(Long id, Long carId);

    // Status üzrə say
    long countByStatus(CarEditRequestStatus status);
}