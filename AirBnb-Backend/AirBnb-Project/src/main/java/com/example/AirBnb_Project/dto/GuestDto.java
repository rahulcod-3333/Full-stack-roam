package com.example.AirBnb_Project.dto;

import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.entity.enums.Gender;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GuestDto {

    private Long id;
    private String name;
    private Gender gender;
    private LocalDate dateOfBirth;


}
