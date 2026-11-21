
package com.carmarketplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "car_catalog")
@Getter
@Setter
public class CarCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String make;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(length = 200)
    private String variant;

    private Integer yearFrom;

    private Integer yearTo;

    @Column(length = 50)
    private String bodyType;

    private Integer doors;

    private Integer seats;

    @Column(length = 100)
    private String engineCode;

    // Kataloqda mühərrik həcmi cc ilə saxlanılır
    private Integer engineDisplacement;

    private Integer enginePowerBhp;

    private Integer enginePowerKw;

    @Column(length = 30)
    private String engineFuelType;

    @Column(length = 30)
    private String gearboxType;

    private Integer gears;

    @Column(length = 30)
    private String drivetrain;
}
