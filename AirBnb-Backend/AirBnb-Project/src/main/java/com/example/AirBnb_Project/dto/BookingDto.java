package com.example.AirBnb_Project.dto;

import com.example.AirBnb_Project.entity.Guests;
import com.example.AirBnb_Project.entity.Hotel;
import com.example.AirBnb_Project.entity.Room;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.entity.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingDto {
    private long id ;
    @JsonIgnore
    private HotelDto hotel;
    @JsonIgnore
    private RoomDto room;

    private UserDto user;


    private Integer roomsCount;


    private LocalDateTime createdAT;


    private LocalDateTime updatedAt;

    private LocalDate checkInDate;


    private LocalDate checkOutDate;

    private BookingStatus bookingStatus;

    private Set<Guests> guests;

}
