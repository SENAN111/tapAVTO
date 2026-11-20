
package com.carmarketplace.controller;

import com.carmarketplace.dto.CarRequest;
import com.carmarketplace.dto.CarResponse;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;
import com.carmarketplace.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    // Avtomobil yaratmaq
    @PostMapping
    public ResponseEntity<CarResponse> createCar(
            @Valid @RequestBody CarRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(carService.createCar(request));
    }

    // Bütün dərc edilmiş avtomobilləri göstərmək
    @GetMapping
    public ResponseEntity<List<CarResponse>> getAllCars() {

        return ResponseEntity.ok(carService.getAllCars());
    }

    // İstifadəçinin öz elanlarını göstərmək
    @GetMapping("/my-cars")
    public ResponseEntity<List<CarResponse>> getMyCars() {

        return ResponseEntity.ok(carService.getMyCars());
    }

    // Avtomobilləri axtarmaq və filter etmək
    @GetMapping("/search")
    public ResponseEntity<Page<CarResponse>> searchCars(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minYear,
            @RequestParam(required = false) Integer maxYear,
            @RequestParam(required = false) FuelType fuelType,
            @RequestParam(required = false) Transmission transmission,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        return ResponseEntity.ok(
                carService.searchCars(
                        brand,
                        model,
                        minPrice,
                        maxPrice,
                        minYear,
                        maxYear,
                        fuelType,
                        transmission,
                        sortBy,
                        direction,
                        page,
                        size
                )
        );
    }

    // ID ilə avtomobil tapmaq
    @GetMapping("/{id}")
    public ResponseEntity<CarResponse> getCarById(
            @PathVariable Long id) {

        return ResponseEntity.ok(carService.getCarById(id));
    }

    // Elanı dərc etmək
    @PostMapping("/{id}/publish")
    public ResponseEntity<CarResponse> publishCar(
            @PathVariable Long id) {

        return ResponseEntity.ok(carService.publishCar(id));
    }

    // Avtomobili yeniləmək
    @PutMapping("/{id}")
    public ResponseEntity<CarResponse> updateCar(
            @PathVariable Long id,
            @Valid @RequestBody CarRequest request) {

        carService.updateCar(id, request);

        return ResponseEntity.ok(carService.getCarById(id));
    }

    // Avtomobili silmək
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(
            @PathVariable Long id) {

        carService.deleteCar(id);

        return ResponseEntity.noContent().build();
    }
}
