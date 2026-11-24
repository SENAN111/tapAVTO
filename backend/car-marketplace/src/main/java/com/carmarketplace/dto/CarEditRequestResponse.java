
package com.carmarketplace.dto;

import com.carmarketplace.entity.enums.CarEditRequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CarEditRequestResponse {

    private Long id;
    private Long carId;

    // Əvvəlki elan məlumatları
    private String oldBrand;
    private String oldModel;
    private Integer oldYear;
    private BigDecimal oldPrice;
    private Long oldMileage;
    private Integer oldHorsePower;
    private BigDecimal oldEngineVolume;

    private String oldFuelType;
    private String oldTransmission;
    private String oldBodyType;
    private String oldSeatCount;
    private String oldDrivetrain;

    private String oldColor;
    private String oldDescription;
    private String oldContactPhone;
    private String oldLocation;

    // Əvvəlki elan şəkilləri
    private List<String> oldImageUrls;

    // Satıcının təklif etdiyi yeni məlumatlar
    private String brand;
    private String model;
    private Integer year;
    private BigDecimal price;
    private Long mileage;
    private Integer horsePower;
    private BigDecimal engineVolume;

    private String fuelType;
    private String transmission;
    private String bodyType;
    private String seatCount;
    private String drivetrain;

    private String color;
    private String description;
    private String contactPhone;
    private String location;

    // Yeni yüklənmiş şəkillər
    private List<String> imageUrls;

    // Sorğunun vəziyyəti
    private CarEditRequestStatus status;
    private String rejectionReason;

    // Sorğu və təsdiq məlumatları
    private String requestedBy;
    private String reviewedBy;

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
