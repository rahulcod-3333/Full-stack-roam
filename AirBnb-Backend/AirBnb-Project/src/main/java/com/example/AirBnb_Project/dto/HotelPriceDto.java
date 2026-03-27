package com.example.AirBnb_Project.dto;

import com.example.AirBnb_Project.entity.Hotel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HotelPriceDto {
    private Hotel hotel ;
    private double price ;

}
