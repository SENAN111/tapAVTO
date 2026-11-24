
package com.carmarketplace.service;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.CarEditRequest;
import com.carmarketplace.entity.CarEditRequestImage;
import com.carmarketplace.entity.CarImage;
import com.carmarketplace.entity.enums.CarEditRequestStatus;
import com.carmarketplace.repository.CarEditRequestImageRepository;
import com.carmarketplace.repository.CarEditRequestRepository;
import com.carmarketplace.repository.CarImageRepository;
import com.carmarketplace.repository.CarRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class CarImageService {

    private final Cloudinary cloudinary;
    private final CarImageRepository carImageRepository;
    private final CarRepository carRepository;
    private final CarEditRequestRepository carEditRequestRepository;
    private final CarEditRequestImageRepository carEditRequestImageRepository;

    public CarImageService(
            Cloudinary cloudinary,
            CarImageRepository carImageRepository,
            CarRepository carRepository,
            CarEditRequestRepository carEditRequestRepository,
            CarEditRequestImageRepository carEditRequestImageRepository
    ) {
        this.cloudinary = cloudinary;
        this.carImageRepository = carImageRepository;
        this.carRepository = carRepository;
        this.carEditRequestRepository = carEditRequestRepository;
        this.carEditRequestImageRepository = carEditRequestImageRepository;
    }

    // Mövcud avtomobilə şəkil yükləmək
    public CarImage uploadImage(Long carId, MultipartFile file)
            throws IOException {

        Car car = carRepository.findById(carId)
                .orElseThrow(() ->
                        new RuntimeException("Car not found"));

        checkOwnershipOrAdmin(car);

        long imageCount =
                carImageRepository.countByCar_Id(carId);

        if (imageCount >= 10) {
            throw new RuntimeException(
                    "Bir avtomobil üçün maksimum 10 şəkil yükləmək olar"
            );
        }

        validateImage(file);

        Map<?, ?> uploadResult = cloudinary.uploader().upload(
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

    // Redaktə sorğusuna ayrıca şəkil yükləmək
    public CarEditRequestImage uploadEditRequestImage(
            Long requestId,
            MultipartFile file
    ) throws IOException {

        CarEditRequest editRequest = carEditRequestRepository
                .findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException("Redaktə sorğusu tapılmadı"));

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            throw new AccessDeniedException(
                    "İstifadəçi autentifikasiya olunmayıb"
            );
        }

        String currentEmail = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        boolean isOwner = editRequest.getRequestedBy() != null &&
                editRequest.getRequestedBy().getEmail()
                        .equals(currentEmail);

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException(
                    "Bu redaktə sorğusuna şəkil əlavə etmək icazəniz yoxdur"
            );
        }

        if (editRequest.getStatus() != CarEditRequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Yalnız gözləmədə olan redaktə sorğusuna şəkil əlavə etmək olar"
            );
        }

        long imageCount = carEditRequestImageRepository
                .countByEditRequest_Id(requestId);

        if (imageCount >= 10) {
            throw new RuntimeException(
                    "Redaktə sorğusuna maksimum 10 yeni şəkil əlavə etmək olar"
            );
        }

        validateImage(file);

        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.emptyMap()
        );

        CarEditRequestImage editRequestImage =
                new CarEditRequestImage();

        editRequestImage.setImageUrl(
                uploadResult.get("secure_url").toString()
        );

        editRequestImage.setPublicId(
                uploadResult.get("public_id").toString()
        );

        editRequestImage.setEditRequest(editRequest);
        editRequestImage.setPrimary(imageCount == 0);
        editRequestImage.setDisplayOrder((int) imageCount + 1);

        try {
            return carEditRequestImageRepository.save(editRequestImage);
        } catch (RuntimeException exception) {
            cloudinary.uploader().destroy(
                    editRequestImage.getPublicId(),
                    ObjectUtils.emptyMap()
            );
            throw exception;
        }
    }

    // Şəkil faylının yoxlanılması
    private void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Şəkil seçilməyib");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {
            throw new IllegalArgumentException(
                    "Yalnız şəkil formatında fayl yükləmək olar"
            );
        }
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
    public void deleteImage(Long carId, Long imageId)
            throws IOException {

        CarImage image = carImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        if (!image.getCar().getId().equals(carId)) {
            throw new IllegalArgumentException(
                    "Image does not belong to this car"
            );
        }

        checkOwnershipOrAdmin(image.getCar());

        cloudinary.uploader().destroy(
                image.getPublicId(),
                ObjectUtils.emptyMap()
        );

        carImageRepository.delete(image);

        List<CarImage> remainingImages =
                carImageRepository
                        .findAllByCar_IdOrderByDisplayOrderAsc(carId);

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

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            throw new AccessDeniedException(
                    "İstifadəçi autentifikasiya olunmayıb"
            );
        }

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
