
package com.carmarketplace.repository;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.enums.CarStatus;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface CarRepository extends JpaRepository<Car, Long> {

    // Statusa görə avtomobilləri tapmaq
    List<Car> findAllByStatus(CarStatus status);

    // Daxil olmuş istifadəçinin öz elanlarını tapmaq
    List<Car> findAllByOwner_Email(String email);

    // Avtomobilləri axtarmaq və filter etmək
    @Query("""
            SELECT c FROM Car c
            WHERE c.status = :status
            AND (CAST(:brand AS string) IS NULL OR LOWER(c.brand) LIKE LOWER(CONCAT('%', CAST(:brand AS string), '%')))
            AND (CAST(:model AS string) IS NULL OR LOWER(c.model) LIKE LOWER(CONCAT('%', CAST(:model AS string), '%')))
            AND (:minPrice IS NULL OR c.price >= :minPrice)
            AND (:maxPrice IS NULL OR c.price <= :maxPrice)
            AND (:minYear IS NULL OR c.year >= :minYear)
            AND (:maxYear IS NULL OR c.year <= :maxYear)
            AND (:fuelType IS NULL OR c.fuelType = :fuelType)
            AND (:transmission IS NULL OR c.transmission = :transmission)
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
