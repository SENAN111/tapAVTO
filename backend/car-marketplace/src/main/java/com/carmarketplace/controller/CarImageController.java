
package com.carmarketplace.controller;

import com.carmarketplace.entity.CarEditRequestImage;
import com.carmarketplace.entity.CarImage;
import com.carmarketplace.service.CarImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/cars")
public class CarImageController {

    private final CarImageService carImageService;

    public CarImageController(CarImageService carImageService) {
        this.carImageService = carImageService;
    }

    // Mövcud avtomobilə şəkil yükləmək
    @PostMapping("/{carId}/images")
    public ResponseEntity<CarImage> uploadImage(
            @PathVariable Long carId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        CarImage carImage = carImageService.uploadImage(carId, file);

        return ResponseEntity.ok(carImage);
    }

    // Redaktə sorğusuna yeni şəkil yükləmək
    @PostMapping("/edit-requests/{requestId}/images")
    public ResponseEntity<CarEditRequestImage> uploadEditRequestImage(
            @PathVariable Long requestId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        CarEditRequestImage image =
                carImageService.uploadEditRequestImage(requestId, file);

        return ResponseEntity.ok(image);
    }

    // Avtomobil şəklini silmək
    @DeleteMapping("/{carId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long carId,
            @PathVariable Long imageId
    ) throws IOException {

        carImageService.deleteImage(carId, imageId);

        return ResponseEntity.noContent().build();
    }

    // Avtomobilin bütün şəkillərini göstərmək
    @GetMapping("/{carId}/images")
    public ResponseEntity<List<CarImage>> getCarImages(
            @PathVariable Long carId
    ) {

        return ResponseEntity.ok(
                carImageService.getCarImages(carId)
        );
    }
}
