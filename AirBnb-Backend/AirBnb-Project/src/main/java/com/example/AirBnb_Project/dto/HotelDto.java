package com.example.AirBnb_Project.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.util.List;

@Data
public class HotelDto {
    private Long id;
    private String name;
    private String city;
    private String[] photos;
    private String[] amenities;
    private boolean isActive;
    @JsonIgnore
    private String HotelContactInfo;
    // Send the rooms downwards
    private List<RoomDto> rooms;

    // Just send the ID to prevent looping back to the User entity
    private Long ownerId;
}