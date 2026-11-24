
package com.carmarketplace.repository;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.enums.CarStatus;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {

    // Bütün elanlar
    List<Car> findAllByOrderByCreatedAtDesc();

    // Statusa görə elanlar
    List<Car> findAllByStatus(CarStatus status);

    List<Car> findAllByStatusIn(List<CarStatus> statuses);

    List<Car> findAllByStatusOrderByCreatedAtDesc(CarStatus status);

    List<Car> findAllByStatusInOrderByCreatedAtDesc(
            List<CarStatus> statuses
    );

    // Silinmiş elanlar
    List<Car> findAllByStatusOrderByDeletedAtDesc(
            CarStatus status
    );

    // İstifadəçinin elanları
    List<Car> findAllByOwner_Email(String email);

    List<Car> findAllByOwner_EmailOrderByCreatedAtDesc(
            String email
    );

    // ID və status üzrə elan tapmaq
    Optional<Car> findByIdAndStatus(
            Long id,
            CarStatus status
    );

    // Status üzrə saylar
    long countByStatus(CarStatus status);

    long countByStatusIn(List<CarStatus> statuses);

    // İstifadəçinin elan sayı
    long countByOwner_Email(String email);

    // Müəyyən tarixdən sonra yaradılmış elanların sayı
    long countByCreatedAtAfter(LocalDateTime dateTime);

    // Müəyyən tarixdən sonra redaktə edilmiş elanların sayı
    long countByUpdatedAtAfter(LocalDateTime dateTime);

    // Müəyyən tarixdən sonra yoxlanılmış elanların sayı
    long countByReviewedAtAfter(LocalDateTime dateTime);

    // Status və tarix üzrə yaradılmış elanların sayı
    long countByStatusAndCreatedAtAfter(
            CarStatus status,
            LocalDateTime dateTime
    );

    // Status və tarix üzrə yoxlanılmış elanların sayı
    long countByStatusAndReviewedAtAfter(
            CarStatus status,
            LocalDateTime dateTime
    );

    // Avtomobil axtarışı və filter
    @Query("""
        SELECT c FROM Car c
        WHERE c.status = :status
        AND (
            CAST(:brand AS string) IS NULL
            OR LOWER(c.brand) LIKE
            LOWER(CONCAT('%', CAST(:brand AS string), '%'))
        )
        AND (
            CAST(:model AS string) IS NULL
            OR LOWER(c.model) LIKE
            LOWER(CONCAT('%', CAST(:model AS string), '%'))
        )
        AND (:minPrice IS NULL OR c.price >= :minPrice)
        AND (:maxPrice IS NULL OR c.price <= :maxPrice)
        AND (:minYear IS NULL OR c.year >= :minYear)
        AND (:maxYear IS NULL OR c.year <= :maxYear)
        AND (:fuelType IS NULL OR c.fuelType = :fuelType)
        AND (:transmission IS NULL OR c.transmission = :transmission)
        ORDER BY c.createdAt DESC
    """)
    Page<Car> searchCars(
            @Param("status") CarStatus status,
            @Param("brand") String brand,
            @Param("model") String model,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear,
            @Param("fuelType") FuelType fuelType,
            @Param("transmission") Transmission transmission,
            Pageable pageable
    );
}
