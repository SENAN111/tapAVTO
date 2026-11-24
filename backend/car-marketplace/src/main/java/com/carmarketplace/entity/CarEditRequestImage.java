package com.carmarketplace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "car_edit_request_images")
@Getter
@Setter
public class CarEditRequestImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @Column(nullable = false, unique = true)
    private String publicId;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edit_request_id", nullable = false)
    private CarEditRequest editRequest;
}