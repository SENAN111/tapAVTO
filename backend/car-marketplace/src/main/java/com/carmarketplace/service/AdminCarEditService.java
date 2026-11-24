
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCarEditService {

    private final CarEditRequestRepository editRequestRepository;
    private final CarEditRequestImageRepository editRequestImageRepository;
    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final Cloudinary cloudinary;
    private final NotificationService notificationService;

    // Admin redaktə sorğusunu təsdiqləyir
    @Transactional
    public void approveEditRequest(Long requestId) {

        CarEditRequest editRequest = findPendingRequest(requestId);

        Car car = editRequest.getCar();

        if (car == null) {
            throw new IllegalStateException(
                    "Redaktə sorğusuna aid elan tapılmadı"
            );
        }

        List<CarEditRequestImage> stagedImages =
                editRequestImageRepository
                        .findAllByEditRequest_IdOrderByDisplayOrderAsc(
                                requestId
                        );

        List<CarImage> existingImages =
                carImageRepository
                        .findAllByCar_IdOrderByDisplayOrderAsc(car.getId());

        if (existingImages.size() + stagedImages.size() > 10) {
            throw new IllegalStateException(
                    "Elanın ümumi şəkil sayı 10-dan çox ola bilməz. " +
                            "Təsdiqdən əvvəl artıq şəkilləri silmək lazımdır."
            );
        }

        // Yeni avtomobil məlumatlarını əsas elana tətbiq edirik
        car.setBrand(editRequest.getBrand());
        car.setModel(editRequest.getModel());
        car.setYear(editRequest.getYear());
        car.setPrice(editRequest.getPrice());
        car.setMileage(editRequest.getMileage());
        car.setHorsePower(editRequest.getHorsePower());
        car.setEngineVolume(editRequest.getEngineVolume());

        car.setFuelType(editRequest.getFuelType());
        car.setTransmission(editRequest.getTransmission());
        car.setBodyType(editRequest.getBodyType());
        car.setSeatCount(editRequest.getSeatCount());
        car.setDrivetrain(editRequest.getDrivetrain());

        car.setColor(editRequest.getColor());
        car.setDescription(editRequest.getDescription());
        car.setContactPhone(editRequest.getContactPhone());
        car.setLocation(editRequest.getLocation());

        // Yeni şəkilləri əsas elanın şəkillərinə köçürürük
        List<CarImage> imagesToSave = new ArrayList<>();

        int nextOrder = existingImages.size() + 1;

        boolean hasPrimaryImage = existingImages.stream()
                .anyMatch(CarImage::isPrimary);

        for (CarEditRequestImage stagedImage : stagedImages) {

            CarImage carImage = new CarImage();

            carImage.setImageUrl(stagedImage.getImageUrl());
            carImage.setPublicId(stagedImage.getPublicId());
            carImage.setCar(car);

            carImage.setPrimary(
                    !hasPrimaryImage && imagesToSave.isEmpty()
            );

            carImage.setDisplayOrder(nextOrder++);

            imagesToSave.add(carImage);
        }

        carRepository.save(car);

        if (!imagesToSave.isEmpty()) {
            carImageRepository.saveAll(imagesToSave);
        }

        // Şəkillər əsas elana köçürüldüyü üçün
        // müvəqqəti redaktə şəkillərinin DB qeydlərini silirik.
        // Cloudinary fayllarını SİLMİRİK.
        editRequest.getImages().clear();

        editRequest.setStatus(CarEditRequestStatus.APPROVED);
        editRequest.setReviewedAt(LocalDateTime.now());
        editRequest.setReviewedBy(
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName()
        );

        editRequestRepository.save(editRequest);

        // Satıcıya təsdiq bildirişi
        if (editRequest.getRequestedBy() != null) {
            notificationService.notifySeller(
                    editRequest.getRequestedBy().getEmail(),
                    "Elan redaktəsi təsdiqləndi",
                    car.getBrand() + " " + car.getModel()
                            + " elanınızın redaktə sorğusu admin tərəfindən təsdiqləndi. "
                            + "Yeni məlumatlar artıq elanda tətbiq olunub.",
                    car.getId()
            );
        }
    }

    // Admin redaktə sorğusunu rədd edir
    @Transactional
    public void rejectEditRequest(Long requestId, String reason) {

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException(
                    "Rədd edilmə səbəbi boş ola bilməz"
            );
        }

        if (reason.length() > 500) {
            throw new IllegalArgumentException(
                    "Rədd edilmə səbəbi maksimum 500 simvol ola bilər"
            );
        }

        CarEditRequest editRequest = findPendingRequest(requestId);

        Car car = editRequest.getCar();

        List<CarEditRequestImage> stagedImages =
                editRequestImageRepository
                        .findAllByEditRequest_IdOrderByDisplayOrderAsc(
                                requestId
                        );

        // Yalnız redaktə sorğusu üçün yüklənmiş şəkilləri silirik.
        // Əsas elanın əvvəlki şəkillərinə toxunmuruq.
        for (CarEditRequestImage image : stagedImages) {

            if (image.getPublicId() != null &&
                    !image.getPublicId().isBlank()) {

                try {
                    cloudinary.uploader().destroy(
                            image.getPublicId(),
                            ObjectUtils.emptyMap()
                    );
                } catch (Exception exception) {
                    throw new IllegalStateException(
                            "Redaktə şəkillərini Cloudinary-dən silmək mümkün olmadı",
                            exception
                    );
                }
            }
        }

        // Müvəqqəti şəkil qeydlərini silirik
        editRequest.getImages().clear();

        // Əsas Car obyektinə toxunmuruq.
        // Əvvəlki təsdiqlənmiş elan aktiv qalır.
        editRequest.setStatus(CarEditRequestStatus.REJECTED);
        editRequest.setRejectionReason(reason.trim());
        editRequest.setReviewedAt(LocalDateTime.now());
        editRequest.setReviewedBy(
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName()
        );

        editRequestRepository.save(editRequest);

        // Satıcıya rədd səbəbi ilə birlikdə bildiriş
        if (editRequest.getRequestedBy() != null) {
            notificationService.notifySeller(
                    editRequest.getRequestedBy().getEmail(),
                    "Elan redaktəsi rədd edildi",
                    (car != null
                            ? car.getBrand() + " " + car.getModel()
                            : "Elan")
                            + " üzrə redaktə sorğunuz rədd edildi. "
                            + "Səbəb: " + reason.trim()
                            + ". Əvvəlki elanınız aktiv qalır.",
                    car != null ? car.getId() : null
            );
        }
    }

    private CarEditRequest findPendingRequest(Long requestId) {

        CarEditRequest request = editRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                        "Redaktə sorğusu tapılmadı"
                ));

        if (request.getStatus() != CarEditRequestStatus.PENDING) {
            throw new IllegalStateException(
                    "Bu redaktə sorğusu artıq nəzərdən keçirilib"
            );
        }

        return request;
    }
}
