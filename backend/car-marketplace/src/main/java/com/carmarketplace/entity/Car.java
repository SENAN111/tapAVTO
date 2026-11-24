
package com.carmarketplace.entity;

import com.carmarketplace.entity.enums.CarStatus;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;
import com.carmarketplace.entity.enums.BodyType;
import com.carmarketplace.entity.enums.SeatCount;
import com.carmarketplace.entity.enums.Drivetrain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;
    private String model;
    private Integer year;

    private BigDecimal price;
    private Long mileage;

    private BigDecimal engineVolume;
    private Integer horsePower;

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

    @Column(columnDefinition = "TEXT")
    private String description;

    private String contactPhone;
    private String location;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    private String deletedBy;

    @Enumerated(EnumType.STRING)
    private CarStatus statusBeforeDelete;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CarStatus status = CarStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime reviewedAt;

    private String reviewedBy;

    @OneToMany(
            mappedBy = "car",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<CarImage> images = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }

        if (status == null) {
            status = CarStatus.DRAFT;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Long getMileage() { return mileage; }
    public void setMileage(Long mileage) { this.mileage = mileage; }

    public BigDecimal getEngineVolume() { return engineVolume; }
    public void setEngineVolume(BigDecimal engineVolume) {
        this.engineVolume = engineVolume;
    }

    public Integer getHorsePower() { return horsePower; }
    public void setHorsePower(Integer horsePower) {
        this.horsePower = horsePower;
    }

    public FuelType getFuelType() { return fuelType; }
    public void setFuelType(FuelType fuelType) {
        this.fuelType = fuelType;
    }

    public Transmission getTransmission() { return transmission; }
    public void setTransmission(Transmission transmission) {
        this.transmission = transmission;
    }

    public BodyType getBodyType() { return bodyType; }
    public void setBodyType(BodyType bodyType) {
        this.bodyType = bodyType;
    }

    public SeatCount getSeatCount() { return seatCount; }
    public void setSeatCount(SeatCount seatCount) {
        this.seatCount = seatCount;
    }

    public Drivetrain getDrivetrain() { return drivetrain; }
    public void setDrivetrain(Drivetrain drivetrain) {
        this.drivetrain = drivetrain;
    }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getDescription() { return description; }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getLocation() { return location; }
    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getDeletedBy() { return deletedBy; }
    public void setDeletedBy(String deletedBy) {
        this.deletedBy = deletedBy;
    }

    public CarStatus getStatusBeforeDelete() {
        return statusBeforeDelete;
    }

    public void setStatusBeforeDelete(CarStatus statusBeforeDelete) {
        this.statusBeforeDelete = statusBeforeDelete;
    }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public CarStatus getStatus() { return status; }
    public void setStatus(CarStatus status) {
        this.status = status;
    }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public List<CarImage> getImages() { return images; }
    public void setImages(List<CarImage> images) {
        this.images = images;
    }
}
