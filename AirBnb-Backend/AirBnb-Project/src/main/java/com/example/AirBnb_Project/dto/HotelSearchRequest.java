package com.example.AirBnb_Project.dto;

import jakarta.persistence.Entity;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HotelSearchRequest {

    private String city;
    private LocalDate startAt;
    private LocalDate endAt;
    private Integer roomsCount;
    private Integer page=0;
    private Integer size=10;
}
