
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final CarImageService carImageService;

    // Daxil olmuş istifadəçinin email ünvanını əldə etmək
    private String getCurrentUserEmail() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
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

    // Bütün dərc edilmiş avtomobilləri göstərmək
    public List<CarResponse> getAllCars() {

        return carRepository.findAllByStatus(CarStatus.PUBLISHED)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // İstifadəçinin öz elanlarını göstərmək
    public List<CarResponse> getMyCars() {

        String email = getCurrentUserEmail();

        return carRepository.findAllByOwner_Email(email)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Avtomobilləri filter və axtarış etmək
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
                        CarStatus.PUBLISHED,
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
    public CarResponse getCarById(Long id) {

        return mapToResponse(findCarById(id));
    }

    // Elanı dərc etmək
    public CarResponse publishCar(Long id) {

        Car car = findCarById(id);

        checkOwnershipOrAdmin(car);

        if (car.getBodyType() == null) {
            throw new IllegalStateException(
                    "Elanı dərc etmək üçün ban növü seçilməlidir"
            );
        }

        carImageService.validateMinimumImages(id);

        car.setStatus(CarStatus.PUBLISHED);

        Car savedCar = carRepository.save(car);

        return mapToResponse(savedCar);
    }

    // Avtomobili silmək
    public void deleteCar(Long id) {

        Car car = findCarById(id);

        checkOwnershipOrAdmin(car);

        carRepository.delete(car);
    }

    // Avtomobili yeniləmək
    public Car updateCar(Long id, CarRequest request) {

        Car existingCar = findCarById(id);

        checkOwnershipOrAdmin(existingCar);

        existingCar.setBrand(request.getBrand());
        existingCar.setModel(request.getModel());
        existingCar.setYear(request.getYear());
        existingCar.setPrice(request.getPrice());
        existingCar.setMileage(request.getMileage());
        existingCar.setFuelType(request.getFuelType());
        existingCar.setTransmission(request.getTransmission());
        existingCar.setBodyType(request.getBodyType());
        existingCar.setColor(request.getColor());
        existingCar.setDescription(request.getDescription());
        existingCar.setContactPhone(request.getContactPhone());

        return carRepository.save(existingCar);
    }

    // Sahiblik və Admin yoxlaması
    private void checkOwnershipOrAdmin(Car car) {

        var authentication = SecurityContextHolder
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
        car.setFuelType(request.getFuelType());
        car.setTransmission(request.getTransmission());
        car.setBodyType(request.getBodyType());
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
        response.setFuelType(car.getFuelType());
        response.setTransmission(car.getTransmission());
        response.setBodyType(car.getBodyType());
        response.setColor(car.getColor());
        response.setDescription(car.getDescription());
        response.setContactPhone(car.getContactPhone());

        if (car.getOwner() != null) {
            response.setOwnerName(
                    car.getOwner().getFirstName() + " "
                            + car.getOwner().getLastName()
            );
        }

        return response;
    }
}
