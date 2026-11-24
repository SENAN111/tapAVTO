
package com.carmarketplace.service;

import com.carmarketplace.dto.CarEditRequestResponse;
import com.carmarketplace.dto.CarRequest;
import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.CarEditRequest;
import com.carmarketplace.entity.User;
import com.carmarketplace.entity.enums.CarEditRequestStatus;
import com.carmarketplace.entity.enums.CarStatus;
import com.carmarketplace.repository.CarEditRequestRepository;
import com.carmarketplace.repository.CarRepository;
import com.carmarketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarEditRequestService {

    private final CarEditRequestRepository editRequestRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Satıcının təsdiqlənmiş elan üçün redaktə sorğusu yaratması
    @Transactional
    public CarEditRequestResponse submitEditRequest(
            Long carId,
            CarRequest request
    ) {

        Car car = carRepository.findById(carId)
                .orElseThrow(() ->
                        new RuntimeException("Elan tapılmadı"));

        User currentUser = getCurrentUser();

        boolean isAdmin = currentUser.getRoles()
                .stream()
                .anyMatch(role ->
                        role.getName().name().equals("ROLE_ADMIN"));

        boolean isOwner = car.getOwner() != null &&
                car.getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException(
                    "Bu elanı redaktə etmək hüququnuz yoxdur"
            );
        }

        if (car.getStatus() != CarStatus.APPROVED &&
                car.getStatus() != CarStatus.PUBLISHED) {

            throw new IllegalStateException(
                    "Redaktə sorğusu yalnız təsdiqlənmiş elan üçün yaradıla bilər"
            );
        }

        boolean hasPendingRequest =
                editRequestRepository.existsByCar_IdAndStatus(
                        carId,
                        CarEditRequestStatus.PENDING
                );

        if (hasPendingRequest) {
            throw new IllegalStateException(
                    "Bu elan üçün artıq gözləyən redaktə sorğusu mövcuddur"
            );
        }

        CarEditRequest editRequest = new CarEditRequest();

        editRequest.setCar(car);
        editRequest.setRequestedBy(currentUser);

        editRequest.setBrand(request.getBrand());
        editRequest.setModel(request.getModel());
        editRequest.setYear(request.getYear());
        editRequest.setPrice(request.getPrice());
        editRequest.setMileage(request.getMileage());
        editRequest.setHorsePower(request.getHorsePower());
        editRequest.setEngineVolume(request.getEngineVolume());

        editRequest.setFuelType(request.getFuelType());
        editRequest.setTransmission(request.getTransmission());
        editRequest.setBodyType(request.getBodyType());
        editRequest.setSeatCount(request.getSeatCount());
        editRequest.setDrivetrain(request.getDrivetrain());

        editRequest.setColor(request.getColor());
        editRequest.setDescription(request.getDescription());
        editRequest.setContactPhone(request.getContactPhone());
        editRequest.setLocation(request.getLocation());

        editRequest.setStatus(CarEditRequestStatus.PENDING);

        CarEditRequest savedRequest =
                editRequestRepository.save(editRequest);

        // Yeni redaktə sorğusu barədə bütün adminlərə bildiriş
        notificationService.notifyAdmins(
                "Yeni elan redaktə sorğusu",
                currentUser.getEmail()
                        + " istifadəçisi "
                        + car.getBrand()
                        + " "
                        + car.getModel()
                        + " elanında dəyişiklik etmək üçün sorğu göndərdi.",
                car.getId()
        );

        return mapToResponse(savedRequest);
    }

    // Admin üçün gözləyən redaktə sorğuları
    @Transactional(readOnly = true)
    public List<CarEditRequestResponse> getPendingRequests() {

        return editRequestRepository
                .findAllByStatusOrderByCreatedAtDesc(
                        CarEditRequestStatus.PENDING
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Satıcının öz redaktə sorğuları
    @Transactional(readOnly = true)
    public List<CarEditRequestResponse> getMyRequests() {

        User currentUser = getCurrentUser();

        return editRequestRepository
                .findAllByRequestedBy_EmailOrderByCreatedAtDesc(
                        currentUser.getEmail()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Sorğunu əvvəlki və yeni məlumatlarla DTO-ya çevirmək
    private CarEditRequestResponse mapToResponse(
            CarEditRequest request
    ) {

        CarEditRequestResponse response =
                new CarEditRequestResponse();

        Car car = request.getCar();

        response.setId(request.getId());
        response.setCarId(car.getId());

        // Əvvəlki elan məlumatları
        response.setOldBrand(car.getBrand());
        response.setOldModel(car.getModel());
        response.setOldYear(car.getYear());
        response.setOldPrice(car.getPrice());
        response.setOldMileage(car.getMileage());
        response.setOldHorsePower(car.getHorsePower());
        response.setOldEngineVolume(car.getEngineVolume());

        response.setOldFuelType(
                car.getFuelType() != null
                        ? car.getFuelType().name()
                        : null
        );

        response.setOldTransmission(
                car.getTransmission() != null
                        ? car.getTransmission().name()
                        : null
        );

        response.setOldBodyType(
                car.getBodyType() != null
                        ? car.getBodyType().name()
                        : null
        );

        response.setOldSeatCount(
                car.getSeatCount() != null
                        ? car.getSeatCount().name()
                        : null
        );

        response.setOldDrivetrain(
                car.getDrivetrain() != null
                        ? car.getDrivetrain().name()
                        : null
        );

        response.setOldColor(car.getColor());
        response.setOldDescription(car.getDescription());
        response.setOldContactPhone(car.getContactPhone());
        response.setOldLocation(car.getLocation());

        response.setOldImageUrls(
                car.getImages() == null
                        ? List.of()
                        : car.getImages().stream()
                        .sorted((a, b) ->
                                Integer.compare(
                                        a.getDisplayOrder(),
                                        b.getDisplayOrder()
                                ))
                        .map(image -> image.getImageUrl())
                        .toList()
        );

        // Yeni elan məlumatları
        response.setBrand(request.getBrand());
        response.setModel(request.getModel());
        response.setYear(request.getYear());
        response.setPrice(request.getPrice());
        response.setMileage(request.getMileage());
        response.setHorsePower(request.getHorsePower());
        response.setEngineVolume(request.getEngineVolume());

        response.setFuelType(
                request.getFuelType() != null
                        ? request.getFuelType().name()
                        : null
        );

        response.setTransmission(
                request.getTransmission() != null
                        ? request.getTransmission().name()
                        : null
        );

        response.setBodyType(
                request.getBodyType() != null
                        ? request.getBodyType().name()
                        : null
        );

        response.setSeatCount(
                request.getSeatCount() != null
                        ? request.getSeatCount().name()
                        : null
        );

        response.setDrivetrain(
                request.getDrivetrain() != null
                        ? request.getDrivetrain().name()
                        : null
        );

        response.setColor(request.getColor());
        response.setDescription(request.getDescription());
        response.setContactPhone(request.getContactPhone());
        response.setLocation(request.getLocation());

        // Yeni yüklənmiş şəkillər
        response.setImageUrls(
                request.getImages().stream()
                        .sorted((a, b) ->
                                Integer.compare(
                                        a.getDisplayOrder(),
                                        b.getDisplayOrder()
                                ))
                        .map(image -> image.getImageUrl())
                        .toList()
        );

        response.setStatus(request.getStatus());
        response.setRejectionReason(request.getRejectionReason());

        response.setRequestedBy(
                request.getRequestedBy() != null
                        ? request.getRequestedBy().getEmail()
                        : null
        );

        response.setReviewedBy(request.getReviewedBy());
        response.setCreatedAt(request.getCreatedAt());
        response.setReviewedAt(request.getReviewedAt());

        return response;
    }

    // Hazırda daxil olmuş istifadəçini tapmaq
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "İstifadəçi autentifikasiya olunmayıb"
            );
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("İstifadəçi tapılmadı"));
    }
}
