
package com.carmarketplace.service;

import com.carmarketplace.entity.Car;
import com.carmarketplace.entity.enums.CarStatus;
import com.carmarketplace.repository.CarRepository;
import com.carmarketplace.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminService {

    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AdminService(
            CarRepository carRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Bütün elanlar
    @Transactional(readOnly = true)
    public List<Car> getAllCars() {
        return carRepository.findAllByOrderByCreatedAtDesc();
    }

    // Yoxlama gözləyən elanlar
    @Transactional(readOnly = true)
    public List<Car> getPendingCars() {
        return carRepository.findAllByStatusOrderByCreatedAtDesc(
                CarStatus.PENDING
        );
    }

    // Silinmiş elanlar
    @Transactional(readOnly = true)
    public List<Car> getDeletedCars() {
        return carRepository.findAllByStatusOrderByDeletedAtDesc(
                CarStatus.DELETED
        );
    }

    // Statistikalar
    @Transactional(readOnly = true)
    public Map<String, Long> getStatistics() {

        return Map.of(
                "totalCars", carRepository.count(),
                "pendingCars", carRepository.countByStatus(CarStatus.PENDING),
                "approvedCars",
                carRepository.countByStatus(CarStatus.APPROVED)
                        + carRepository.countByStatus(CarStatus.PUBLISHED),
                "rejectedCars", carRepository.countByStatus(CarStatus.REJECTED),
                "draftCars", carRepository.countByStatus(CarStatus.DRAFT),
                "deletedCars", carRepository.countByStatus(CarStatus.DELETED),
                "totalUsers", userRepository.count()
        );
    }

    // Elanı təsdiqləmək
    public Car approveCar(Long carId, String adminEmail) {

        Car car = findPendingCar(carId);

        car.setStatus(CarStatus.APPROVED);
        car.setRejectionReason(null);
        car.setReviewedAt(LocalDateTime.now());
        car.setReviewedBy(adminEmail);

        Car savedCar = carRepository.save(car);

        notificationService.sendNotification(
                car.getOwner().getEmail(),
                "Elanınız təsdiqləndi",
                car.getBrand() + " " + car.getModel()
                        + " elanı admin tərəfindən təsdiqləndi və artıq kataloqda görünür.",
                car.getId()
        );

        return savedCar;
    }

    // Elanı rədd etmək
    public Car rejectCar(
            Long carId,
            String reason,
            String adminEmail
    ) {

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException(
                    "Rədd edilmə səbəbi mütləq qeyd olunmalıdır."
            );
        }

        Car car = findPendingCar(carId);

        car.setStatus(CarStatus.REJECTED);
        car.setRejectionReason(reason.trim());
        car.setReviewedAt(LocalDateTime.now());
        car.setReviewedBy(adminEmail);

        Car savedCar = carRepository.save(car);

        notificationService.sendNotification(
                car.getOwner().getEmail(),
                "Elanınız rədd edildi",
                car.getBrand() + " " + car.getModel()
                        + " elanı rədd edildi. Səbəb: "
                        + reason.trim()
                        + ". Elanı redaktə edib yenidən yoxlamaya göndərə bilərsiniz.",
                car.getId()
        );

        return savedCar;
    }

    // Elanı arxivə göndərmək (yumşaq silmə)
    public Car deleteCar(Long carId, String adminEmail) {

        Car car = findCar(carId);

        if (car.getStatus() == CarStatus.DELETED) {
            throw new IllegalArgumentException(
                    "Bu elan artıq silinib."
            );
        }

        car.setStatusBeforeDelete(car.getStatus());
        car.setStatus(CarStatus.DELETED);
        car.setDeletedAt(LocalDateTime.now());
        car.setDeletedBy(adminEmail);

        return carRepository.save(car);
    }

    // Silinmiş elanı bərpa etmək
    public Car restoreCar(Long carId) {

        Car car = findCar(carId);

        if (car.getStatus() != CarStatus.DELETED) {
            throw new IllegalArgumentException(
                    "Yalnız silinmiş elanları bərpa etmək mümkündür."
            );
        }

        CarStatus previousStatus = car.getStatusBeforeDelete();

        if (previousStatus == null
                || previousStatus == CarStatus.DELETED) {
            previousStatus = CarStatus.DRAFT;
        }

        car.setStatus(previousStatus);
        car.setStatusBeforeDelete(null);
        car.setDeletedAt(null);
        car.setDeletedBy(null);

        return carRepository.save(car);
    }

    // Elanı bazadan birdəfəlik silmək

    public void permanentlyDeleteCar(Long carId) {

        Car car = findCar(carId);

        if (car.getStatus() != CarStatus.DELETED) {
            throw new IllegalArgumentException(
                    "Birdəfəlik silmək üçün elan əvvəlcə arxivə göndərilməlidir."
            );
        }

        carRepository.delete(car);
    }


    // ID ilə elan tapmaq
    private Car findCar(Long carId) {

        return carRepository.findById(carId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Elan tapılmadı.")
                );
    }

    // Yalnız yoxlama gözləyən elanları tapmaq
    private Car findPendingCar(Long carId) {

        Car car = findCar(carId);

        if (car.getStatus() != CarStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Yalnız yoxlama gözləyən elanlar üzrə bu əməliyyatı etmək olar."
            );
        }

        return car;
    }
}
