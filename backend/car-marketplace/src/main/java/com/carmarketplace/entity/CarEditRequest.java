package com.carmarketplace.entity;

import com.carmarketplace.entity.enums.BodyType;
import com.carmarketplace.entity.enums.CarEditRequestStatus;
import com.carmarketplace.entity.enums.Drivetrain;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.SeatCount;
import com.carmarketplace.entity.enums.Transmission;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "car_edit_requests")
@Getter
@Setter
public class CarEditRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Redaktə edilən əsas elan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    // Redaktə sorğusunu göndərən istifadəçi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    // Elanın yeni məlumatları
    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Long mileage;

    private Integer horsePower;

    @Column(precision = 4, scale = 1)
    private BigDecimal engineVolume;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    private Transmission transmission;

    @Enumerated(EnumType.STRING)
    private BodyType bodyType;

    @Enumerated(EnumType.STRING)
    private SeatCount seatCount;

    @Enumerated(EnumType.STRING)
    private Drivetrain drivetrain;

    private String color;

    @Column(length = 2000)
    private String description;

    private String contactPhone;

    private String location;

    // Moderasiya məlumatları
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CarEditRequestStatus status = CarEditRequestStatus.PENDING;

    private String rejectionReason;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Redaktə üçün yüklənmiş yeni şəkillər
    @OneToMany(
            mappedBy = "editRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("displayOrder ASC")
    private List<CarEditRequestImage> images = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null) {
            status = CarEditRequestStatus.PENDING;
        }
    }
}