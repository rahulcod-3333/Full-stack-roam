package com.example.AirBnb_Project.dto;

import com.example.AirBnb_Project.entity.HotelContactInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.util.List;

@Data
public class HotelDto {
    private Long id ;
    private String name ;

    private String city;

    private String[] photos;

    private String[] amenities;

    @JsonIgnore
    private HotelContactInfo hotelContactInfo;

    private boolean isActive;

    private List<RoomDto> rooms;
}
