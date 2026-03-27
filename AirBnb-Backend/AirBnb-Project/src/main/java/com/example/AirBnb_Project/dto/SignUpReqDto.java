package com.example.AirBnb_Project.dto;

import lombok.Data;

@Data
public class SignUpReqDto {
    private String email , password;
    private String name ;
}
