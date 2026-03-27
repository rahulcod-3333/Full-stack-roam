package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.dto.ProfileUpdateReqDto;
import com.example.AirBnb_Project.dto.UserDto;
import com.example.AirBnb_Project.entity.User;

public interface UserService {
    User getUserId(Long id );
    void updateProfile(ProfileUpdateReqDto profileUpdateRequestDto);

    UserDto getMyProfile();

}
