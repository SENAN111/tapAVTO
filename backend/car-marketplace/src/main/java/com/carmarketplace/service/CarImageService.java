
package com.carmarketplace.service;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.CarImage;
import com.carmarketplace.repository.CarImageRepository;
import com.carmarketplace.repository.CarRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;
import java.util.Map;

@Service
public class CarImageService {

    private final Cloudinary cloudinary;
    private final CarImageRepository carImageRepository;
    private final CarRepository carRepository;

    public CarImageService(
            Cloudinary cloudinary,
            CarImageRepository carImageRepository,
            CarRepository carRepository
    ) {
        this.cloudinary = cloudinary;
        this.carImageRepository = carImageRepository;
        this.carRepository = carRepository;
    }

    // Şəkil yükləmək
    public CarImage uploadImage(Long carId, MultipartFile file)
            throws IOException {

        Car car = carRepository.findById(carId)
                .orElseThrow(() ->
                        new RuntimeException("Car not found"));

        // Avtomobilin sahibini və Admin rolunu yoxla
        checkOwnershipOrAdmin(car);

        long imageCount =
                carImageRepository.countByCar_Id(carId);

        if (imageCount >= 10) {
            throw new RuntimeException(
                    "Bir avtomobil üçün maksimum 10 şəkil yükləmək olar"
            );
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Şəkil seçilməyib");
        }

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.emptyMap()
        );

        CarImage carImage = new CarImage();

        carImage.setImageUrl(
                uploadResult.get("secure_url").toString()
        );

        carImage.setPublicId(
                uploadResult.get("public_id").toString()
        );

        carImage.setCar(car);
        carImage.setPrimary(imageCount == 0);
        carImage.setDisplayOrder((int) imageCount + 1);

        return carImageRepository.save(carImage);
    }

    // Elanın dərc edilməsi üçün minimum şəkil yoxlaması
    public void validateMinimumImages(Long carId) {

        long imageCount =
                carImageRepository.countByCar_Id(carId);

        if (imageCount < 5) {
            throw new IllegalArgumentException(
                    "Elanı dərc etmək üçün minimum 5 şəkil yükləməlisiniz"
            );
        }
    }
    // Avtomobilin bütün şəkillərini göstərmək
    public List<CarImage> getCarImages(Long carId) {

        if (!carRepository.existsById(carId)) {
            throw new RuntimeException("Car not found");
        }

        return carImageRepository
                .findAllByCar_IdOrderByDisplayOrderAsc(carId);
    }
    // Avtomobil şəklini silmək
    public void deleteImage(Long carId, Long imageId) throws IOException {

        CarImage image = carImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        if (!image.getCar().getId().equals(carId)) {
            throw new IllegalArgumentException(
                    "Image does not belong to this car"
            );
        }

        checkOwnershipOrAdmin(image.getCar());

        // Şəkli Cloudinary-dən sil
        cloudinary.uploader().destroy(
                image.getPublicId(),
                ObjectUtils.emptyMap()
        );

        // Şəkli verilənlər bazasından sil
        carImageRepository.delete(image);

        // Qalan şəkilləri sıralı şəkildə əldə et
        List<CarImage> remainingImages =
                carImageRepository.findAllByCar_IdOrderByDisplayOrderAsc(carId);

        // Sıralamanı və əsas şəkli yenilə
        for (int i = 0; i < remainingImages.size(); i++) {

            CarImage remainingImage = remainingImages.get(i);

            remainingImage.setDisplayOrder(i + 1);
            remainingImage.setPrimary(i == 0);
        }

        carImageRepository.saveAll(remainingImages);
    }

    // Avtomobilin sahibini və Admin rolunu yoxlamaq
    private void checkOwnershipOrAdmin(Car car) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String currentEmail = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        boolean isOwner = car.getOwner() != null &&
                car.getOwner().getEmail().equals(currentEmail);

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException(
                    "You are not allowed to upload images for this car"
            );
        }
    }
}
