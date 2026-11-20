
package com.carmarketplace.controller;

import com.carmarketplace.entity.CarImage;
import com.carmarketplace.service.CarImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("/api/cars")
public class CarImageController {

    private final CarImageService carImageService;

    public CarImageController(CarImageService carImageService) {
        this.carImageService = carImageService;
    }

    @PostMapping("/{carId}/images")
    public ResponseEntity<CarImage> uploadImage(
            @PathVariable Long carId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        CarImage carImage = carImageService.uploadImage(carId, file);

        return ResponseEntity.ok(carImage);
    }
    @DeleteMapping("/{carId}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long carId,
            @PathVariable Long imageId
    ) throws IOException {

        carImageService.deleteImage(carId, imageId);

        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{carId}/images")
    public ResponseEntity<List<CarImage>> getCarImages(
            @PathVariable Long carId
    ) {

        return ResponseEntity.ok(
                carImageService.getCarImages(carId)
        );
    }
}
