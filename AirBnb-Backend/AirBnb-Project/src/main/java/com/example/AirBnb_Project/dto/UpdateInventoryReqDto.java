package com.example.AirBnb_Project.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UpdateInventoryReqDto {

    private LocalDate startDate;
    private LocalDate endDate ;
    private BigDecimal surgeFactor;
    private boolean closed ;
}
