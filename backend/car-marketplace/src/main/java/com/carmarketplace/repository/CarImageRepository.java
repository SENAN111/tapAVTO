package com.carmarketplace.repository;

import com.carmarketplace.entity.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarImageRepository extends JpaRepository<CarImage, Long> {

    long countByCar_Id(Long carId);

    List<CarImage> findAllByCar_IdOrderByDisplayOrderAsc(Long carId);
}