
package com.carmarketplace.controller;

import com.carmarketplace.entity.Car;
import com.carmarketplace.service.AdminService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Bütün elanlar
    @GetMapping("/cars")
    public ResponseEntity<List<Car>> getAllCars() {
        return ResponseEntity.ok(
                adminService.getAllCars()
        );
    }

    // Yoxlama gözləyən elanlar
    @GetMapping("/cars/pending")
    public ResponseEntity<List<Car>> getPendingCars() {
        return ResponseEntity.ok(
                adminService.getPendingCars()
        );
    }

    // Silinmiş elanlar
    @GetMapping("/cars/deleted")
    public ResponseEntity<List<Car>> getDeletedCars() {
        return ResponseEntity.ok(
                adminService.getDeletedCars()
        );
    }

    // Elanı təsdiqləmək
    @PatchMapping("/cars/{id}/approve")
    public ResponseEntity<Car> approveCar(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Car approvedCar = adminService.approveCar(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(approvedCar);
    }

    // Elanı rədd etmək
    @PatchMapping("/cars/{id}/reject")
    public ResponseEntity<Car> rejectCar(
            @PathVariable Long id,
            @RequestParam String reason,
            Authentication authentication
    ) {
        Car rejectedCar = adminService.rejectCar(
                id,
                reason,
                authentication.getName()
        );

        return ResponseEntity.ok(rejectedCar);
    }

    // Elanı arxivə göndərmək
    @DeleteMapping("/cars/{id}")
    public ResponseEntity<Car> deleteCar(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Car deletedCar = adminService.deleteCar(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(deletedCar);
    }

    // Silinmiş elanı bərpa etmək
    @PatchMapping("/cars/{id}/restore")
    public ResponseEntity<Car> restoreCar(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                adminService.restoreCar(id)
        );
    }

    // Elanı birdəfəlik silmək
    @DeleteMapping("/cars/{id}/permanent")
    public ResponseEntity<Void> permanentlyDeleteCar(
            @PathVariable Long id
    ) {
        adminService.permanentlyDeleteCar(id);

        return ResponseEntity.noContent().build();
    }

    // Statistikalar
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {
        return ResponseEntity.ok(
                adminService.getStatistics()
        );
    }
}
