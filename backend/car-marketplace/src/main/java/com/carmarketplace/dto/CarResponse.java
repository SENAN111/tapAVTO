
package com.carmarketplace.dto;

import com.carmarketplace.entity.enums.BodyType;
import com.carmarketplace.entity.enums.CarStatus;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;
import com.carmarketplace.entity.enums.SeatCount;
import com.carmarketplace.entity.enums.Drivetrain;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CarResponse {

    private Long id;

    private String brand;
    private String model;
    private Integer year;

    private BigDecimal price;
    private Long mileage;

    // Mühərrik gücü
    private Integer horsePower;

    // Mühərrikin həcmi
    private BigDecimal engineVolume;

    private FuelType fuelType;
    private Transmission transmission;
    private BodyType bodyType;
    private SeatCount seatCount;
    private Drivetrain drivetrain;

    private String color;
    private String description;
    private String ownerName;
    private String contactPhone;
    private String location;

    private LocalDateTime createdAt;

    private CarStatus status;

    // Admin tərəfindən rədd edilmə səbəbi
    private String rejectionReason;

    private List<String> imageUrls;
}
