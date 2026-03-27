package com.example.AirBnb_Project.dto;

import com.example.AirBnb_Project.entity.enums.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileUpdateReqDto {
    private String name;
    private LocalDate dateOfBirth;
    private Gender gender;
}
