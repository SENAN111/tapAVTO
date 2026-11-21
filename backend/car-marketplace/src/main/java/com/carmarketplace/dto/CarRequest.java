
package com.carmarketplace.dto;

import com.carmarketplace.entity.enums.BodyType;
import com.carmarketplace.entity.enums.FuelType;
import com.carmarketplace.entity.enums.Transmission;
import com.carmarketplace.entity.enums.SeatCount;
import com.carmarketplace.entity.enums.Drivetrain;
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

    // Mühərrikin həcmi (L)
    @NotNull(message = "Mühərrikin həcmi qeyd edilməlidir")
    @DecimalMin(value = "0.1", message = "Mühərrikin həcmi ən azı 0.1 L olmalıdır")
    @Digits(
            integer = 2,
            fraction = 1,
            message = "Mühərrikin həcmi bir onluq rəqəmlə qeyd edilməlidir"
    )
    private BigDecimal engineVolume;

    // Mühərrik gücü (at gücü)
    @NotNull(message = "Mühərrik gücü qeyd edilməlidir")
    @Min(value = 1, message = "Mühərrik gücü ən azı 1 a.g. olmalıdır")
    @Max(value = 2000, message = "Mühərrik gücü maksimum 2000 a.g. ola bilər")
    private Integer horsePower;

    @NotNull(message = "Yanacaq növü seçilməlidir")
    private FuelType fuelType;

    @NotNull(message = "Sürətlər qutusu seçilməlidir")
    private Transmission transmission;

    @NotNull(message = "Ban növü seçilməlidir")
    private BodyType bodyType;

    @NotNull(message = "Oturacaq sayı seçilməlidir")
    private SeatCount seatCount;

    @NotNull(message = "Ötürücü növü seçilməlidir")
    private Drivetrain drivetrain;

    @NotBlank(message = "Rəng qeyd edilməlidir")
    @Size(max = 50, message = "Rəng maksimum 50 simvol ola bilər")
    private String color;

    // Avtomobilin yerləşdiyi yer
    @NotBlank(message = "Avtomobilin yerləşdiyi yer qeyd edilməlidir")
    @Size(max = 150, message = "Yerləşmə maksimum 150 simvol ola bilər")
    private String location;

    @Size(max = 2000, message = "Açıqlama maksimum 2000 simvol ola bilər")
    private String description;

    @NotBlank(message = "Telefon nömrəsi boş ola bilməz")
    @Pattern(
            regexp = "^\\+994(10|50|51|55|60|70|77|99)\\d{7}$",
            message = "Telefon nömrəsi düzgün deyil. Nümunə: +994501234567"
    )
    private String contactPhone;
}
