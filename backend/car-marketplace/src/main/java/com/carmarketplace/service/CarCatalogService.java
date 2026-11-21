
package com.carmarketplace.service;

import com.carmarketplace.repository.CarCatalogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarCatalogService {

    private final CarCatalogRepository carCatalogRepository;

    public CarCatalogService(CarCatalogRepository carCatalogRepository) {
        this.carCatalogRepository = carCatalogRepository;
    }

    public List<String> getAllMakes() {
        return carCatalogRepository.findAllMakes();
    }

    public List<String> getModelsByMake(String make) {
        return carCatalogRepository.findModelsByMake(make);
    }
}
