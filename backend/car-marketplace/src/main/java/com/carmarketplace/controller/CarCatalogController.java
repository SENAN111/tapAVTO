
package com.carmarketplace.controller;

import com.carmarketplace.service.CarCatalogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "http://localhost:5173")
public class CarCatalogController {

    private final CarCatalogService carCatalogService;

    public CarCatalogController(CarCatalogService carCatalogService) {
        this.carCatalogService = carCatalogService;
    }

    @GetMapping("/brands")
    public List<String> getAllMakes() {
        return carCatalogService.getAllMakes();
    }

    @GetMapping("/models")
    public List<String> getModelsByMake(@RequestParam String make) {
        return carCatalogService.getModelsByMake(make);
    }
    @GetMapping("/generations")
    public List<String> getGenerationsByMakeAndModel(
            @RequestParam String make,
            @RequestParam String model) {
        return carCatalogService.getGenerationsByMakeAndModel(make, model);
    }
}
