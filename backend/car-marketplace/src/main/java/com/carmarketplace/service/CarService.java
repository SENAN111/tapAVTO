
package com.carmarketplace.service;

import com.carmarketplace.common.exception.ResourceNotFoundException;
import com.carmarketplace.dto.CarRequest;
import com.carmarketplace.dto.CarResponse;
import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.User;
import com.carmarketplace.entity.enums.CarStatus;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;
import com.carmarketplace.repository.CarRepository;
import com.carmarketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final CarImageService carImageService;
    private final NotificationService notificationService;

    // Daxil olmuş istifadəçinin email ünvanı
    private String getCurrentUserEmail() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }

    // Hazırkı istifadəçinin admin olub-olmadığını yoxlamaq
    private boolean isCurrentUserAdmin() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return authentication != null
                && authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));
    }

    // Avtomobil yaratmaq
    public CarResponse createCar(CarRequest request) {

        User owner = userRepository.findByEmail(getCurrentUserEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Car car = mapToEntity(request);
        car.setOwner(owner);
        car.setStatus(CarStatus.DRAFT);

        Car savedCar = carRepository.save(car);

        return mapToResponse(savedCar);
    }

    // Təsdiqlənmiş avtomobilləri göstərmək
    @Transactional(readOnly = true)
    public List<CarResponse> getAllCars() {

        return carRepository.findAllByStatusIn(
                        List.of(CarStatus.APPROVED, CarStatus.PUBLISHED)
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // İstifadəçinin öz elanlarını göstərmək
    @Transactional(readOnly = true)
    public List<CarResponse> getMyCars() {

        String email = getCurrentUserEmail();

        return carRepository.findAllByOwner_Email(email)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Avtomobilləri filter və axtarış etmək
    @Transactional(readOnly = true)
    public Page<CarResponse> searchCars(
            String brand,
            String model,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minYear,
            Integer maxYear,
            FuelType fuelType,
            Transmission transmission,
            String sortBy,
            String direction,
            int page,
            int size
    ) {

        Sort sort = Sort.by(
                direction.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                sortBy
        );

        Pageable pageable = PageRequest.of(page, size, sort);

        return carRepository.searchCars(
                        CarStatus.APPROVED,
                        brand,
                        model,
                        minPrice,
                        maxPrice,
                        minYear,
                        maxYear,
                        fuelType,
                        transmission,
                        pageable
                )
                .map(this::mapToResponse);
    }

    // ID ilə avtomobil tapmaq
    // Təsdiqlənməmiş elanları yalnız sahibi və admin görə bilər
    @Transactional(readOnly = true)
    public CarResponse getCarById(Long id) {

        Car car = findCarById(id);

        boolean isPublic =
                car.getStatus() == CarStatus.APPROVED
                        || car.getStatus() == CarStatus.PUBLISHED;

        if (!isPublic) {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            boolean isAuthenticated =
                    authentication != null
                            && authentication.isAuthenticated()
                            && !"anonymousUser".equals(authentication.getName());

            if (!isAuthenticated) {
                throw new ResourceNotFoundException("Car not found");
            }

            checkOwnershipOrAdmin(car);
        }

        return mapToResponse(car);
    }

    // Elanı admin yoxlamasına göndərmək
    public CarResponse publishCar(Long id) {

        Car car = findCarById(id);

        checkOwnershipOrAdmin(car);

        if (car.getBodyType() == null) {
            throw new IllegalStateException(
                    "Elanı yoxlamaya göndərmək üçün ban növü seçilməlidir"
            );
        }

        if (car.getStatus() == CarStatus.PENDING) {
            throw new IllegalStateException(
                    "Bu elan artıq admin yoxlamasındadır"
            );
        }

        if (car.getStatus() == CarStatus.DELETED) {
            throw new IllegalStateException(
                    "Silinmiş elanı yoxlamaya göndərmək mümkün deyil"
            );
        }

        carImageService.validateMinimumImages(id);

        car.setStatus(CarStatus.PENDING);
        car.setRejectionReason(null);

        Car savedCar = carRepository.save(car);

        // Adminlərə yeni elan haqqında bildiriş göndər
        notificationService.notifyAdmins(
                "Yeni elan yoxlama gözləyir",
                car.getOwner().getFirstName() + " "
                        + car.getOwner().getLastName()
                        + " yeni elan yerləşdirdi: "
                        + car.getBrand() + " " + car.getModel()
                        + ". Elanı yoxlamaq üçün admin panelinə daxil olun.",
                car.getId()
        );

        return mapToResponse(savedCar);
    }

    // Avtomobili silmək
    public void deleteCar(Long id) {

        Car car = findCarById(id);

        checkOwnershipOrAdmin(car);

        car.setStatus(CarStatus.DELETED);

        carRepository.save(car);
    }

    // Avtomobili yeniləmək
    public Car updateCar(Long id, CarRequest request) {

        Car existingCar = findCarById(id);

        checkOwnershipOrAdmin(existingCar);

        if (existingCar.getStatus() == CarStatus.PENDING) {
            throw new IllegalStateException(
                    "Admin yoxlamasında olan elanı redaktə etmək mümkün deyil"
            );
        }

        if (existingCar.getStatus() == CarStatus.DELETED) {
            throw new IllegalStateException(
                    "Silinmiş elanı redaktə etmək mümkün deyil"
            );
        }

        // Satıcı təsdiqlənmiş elanı birbaşa dəyişə bilməz.
        // Redaktə sorğusu üçün POST /api/cars/{id}/edit-request istifadə edilməlidir.
        boolean isApproved =
                existingCar.getStatus() == CarStatus.APPROVED
                        || existingCar.getStatus() == CarStatus.PUBLISHED;

        if (isApproved && !isCurrentUserAdmin()) {
            throw new IllegalStateException(
                    "Təsdiqlənmiş elanı birbaşa redaktə etmək mümkün deyil. "
                            + "Redaktə sorğusu göndərin."
            );
        }

        existingCar.setBrand(request.getBrand());
        existingCar.setModel(request.getModel());
        existingCar.setYear(request.getYear());
        existingCar.setPrice(request.getPrice());
        existingCar.setMileage(request.getMileage());

        existingCar.setEngineVolume(request.getEngineVolume());
        existingCar.setHorsePower(request.getHorsePower());
        existingCar.setLocation(request.getLocation());

        existingCar.setFuelType(request.getFuelType());
        existingCar.setTransmission(request.getTransmission());
        existingCar.setBodyType(request.getBodyType());
        existingCar.setSeatCount(request.getSeatCount());
        existingCar.setDrivetrain(request.getDrivetrain());
        existingCar.setColor(request.getColor());
        existingCar.setDescription(request.getDescription());
        existingCar.setContactPhone(request.getContactPhone());

        // Adminin redaktəsi zamanı təsdiqlənmiş status saxlanılır.
        // DRAFT və REJECTED elanların statusu da dəyişdirilmir.

        return carRepository.save(existingCar);
    }

    // Sahiblik və admin yoxlaması
    private void checkOwnershipOrAdmin(Car car) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String currentEmail = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        boolean isOwner = car.getOwner() != null
                && car.getOwner().getEmail().equals(currentEmail);

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException(
                    "You are not allowed to modify this car"
            );
        }
    }

    // Avtomobili ID ilə tapmaq
    private Car findCarById(Long id) {

        return carRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Car not found with id: " + id
                        ));
    }

    // DTO-dan Entity yaratmaq
    private Car mapToEntity(CarRequest request) {

        Car car = new Car();

        car.setBrand(request.getBrand());
        car.setModel(request.getModel());
        car.setYear(request.getYear());
        car.setPrice(request.getPrice());
        car.setMileage(request.getMileage());

        car.setEngineVolume(request.getEngineVolume());
        car.setHorsePower(request.getHorsePower());
        car.setLocation(request.getLocation());

        car.setFuelType(request.getFuelType());
        car.setTransmission(request.getTransmission());
        car.setBodyType(request.getBodyType());
        car.setSeatCount(request.getSeatCount());
        car.setDrivetrain(request.getDrivetrain());
        car.setColor(request.getColor());
        car.setDescription(request.getDescription());
        car.setContactPhone(request.getContactPhone());

        return car;
    }

    // Entity-dən Response yaratmaq
    private CarResponse mapToResponse(Car car) {

        CarResponse response = new CarResponse();

        response.setId(car.getId());
        response.setBrand(car.getBrand());
        response.setModel(car.getModel());
        response.setYear(car.getYear());
        response.setPrice(car.getPrice());
        response.setMileage(car.getMileage());

        response.setEngineVolume(car.getEngineVolume());
        response.setHorsePower(car.getHorsePower());
        response.setLocation(car.getLocation());
        response.setCreatedAt(car.getCreatedAt());

        response.setFuelType(car.getFuelType());
        response.setTransmission(car.getTransmission());
        response.setSeatCount(car.getSeatCount());
        response.setDrivetrain(car.getDrivetrain());
        response.setBodyType(car.getBodyType());
        response.setColor(car.getColor());
        response.setDescription(car.getDescription());
        response.setContactPhone(car.getContactPhone());

        response.setStatus(car.getStatus());
        response.setRejectionReason(car.getRejectionReason());

        response.setImageUrls(
                car.getImages()
                        .stream()
                        .map(image -> image.getImageUrl())
                        .toList()
        );

        if (car.getOwner() != null) {
            response.setOwnerName(
                    car.getOwner().getFirstName() + " "
                            + car.getOwner().getLastName()
            );
        }

        return response;
    }
}
