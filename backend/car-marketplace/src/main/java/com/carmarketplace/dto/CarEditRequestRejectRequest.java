package com.carmarketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarEditRequestRejectRequest {

    @NotBlank(message = "Rədd edilmə səbəbi boş ola bilməz")
    @Size(max = 500, message = "Səbəb maksimum 500 simvol ola bilər")
    private String reason;
}