
package com.carmarketplace.dto;

import com.carmarketplace.entity.enums.BodyType;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CarRequest {

    @NotBlank(message = "Marka boş ola bilməz")
    @Size(max = 50, message = "Marka maksimum 50 simvol ola bilər")
    private String brand;

    @NotBlank(message = "Model boş ola bilməz")
    @Size(max = 50, message = "Model maksimum 50 simvol ola bilər")
    private String model;

    @NotNull(message = "İstehsal ili qeyd edilməlidir")
    @Min(value = 1886, message = "İstehsal ili 1886-dan kiçik ola bilməz")
    @Max(value = 2026, message = "İstehsal ili gələcək tarix ola bilməz")
    private Integer year;

    @NotNull(message = "Qiymət qeyd edilməlidir")
    @DecimalMin(value = "0.01", message = "Qiymət 0-dan böyük olmalıdır")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Qiymət maksimum 2 onluq rəqəmli ola bilər"
    )
    private BigDecimal price;

    @NotNull(message = "Yürüş qeyd edilməlidir")
    @PositiveOrZero(message = "Yürüş mənfi ola bilməz")
    private Long mileage;

    @NotNull(message = "Yanacaq növü seçilməlidir")
    private FuelType fuelType;

    @NotNull(message = "Sürətlər qutusu seçilməlidir")
    private Transmission transmission;

    @NotNull(message = "Ban növü seçilməlidir")
    private BodyType bodyType;

    @NotBlank(message = "Rəng qeyd edilməlidir")
    @Size(max = 50, message = "Rəng maksimum 50 simvol ola bilər")
    private String color;

    @Size(max = 2000, message = "Açıqlama maksimum 2000 simvol ola bilər")
    private String description;

    @NotBlank(message = "Telefon nömrəsi boş ola bilməz")
    @Pattern(
            regexp = "^\\+994(10|50|51|55|60|70|77|99)\\d{7}$",
            message = "Telefon nömrəsi düzgün deyil. Nümunə: +994501234567"
    )
    private String contactPhone;
}
