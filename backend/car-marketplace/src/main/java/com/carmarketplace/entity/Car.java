
package com.carmarketplace.entity;

import com.carmarketplace.entity.enums.BodyType;
import com.carmarketplace.entity.enums.CarStatus;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;
import com.carmarketplace.entity.enums.SeatCount;
import com.carmarketplace.entity.enums.Drivetrain;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cars")
@Getter
@Setter
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private Long mileage;

    // Mühərrikin həcmi (L)
    @Column(name = "engine_volume", precision = 4, scale = 1)
    private BigDecimal engineVolume;

    // Mühərrik gücü (at gücü)
    @Column(name = "horse_power")
    private Integer horsePower;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    private Transmission transmission;

    @Enumerated(EnumType.STRING)
    @Column(name = "body_type", length = 30)
    private BodyType bodyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_count", length = 20)
    private SeatCount seatCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "drivetrain", length = 20)
    private Drivetrain drivetrain;

    @Column(nullable = false, length = 50)
    private String color;

    @Column(length = 2000)
    private String description;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    // Avtomobilin yerləşdiyi yer
    @Column(length = 150)
    private String location;

    // Elanın yaradılma tarixi avtomatik təyin edilir
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CarStatus status = CarStatus.DRAFT;

    @OneToMany(
            mappedBy = "car",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<CarImage> images = new ArrayList<>();
}
