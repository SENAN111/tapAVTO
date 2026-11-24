package com.carmarketplace.repository;

import com.carmarketplace.entity.CarEditRequestImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarEditRequestImageRepository
        extends JpaRepository<CarEditRequestImage, Long> {

    List<CarEditRequestImage> findAllByEditRequest_IdOrderByDisplayOrderAsc(
            Long editRequestId
    );

    long countByEditRequest_Id(Long editRequestId);
}