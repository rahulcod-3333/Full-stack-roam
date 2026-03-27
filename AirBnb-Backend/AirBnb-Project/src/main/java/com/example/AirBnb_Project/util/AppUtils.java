package com.example.AirBnb_Project.util;

import com.example.AirBnb_Project.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Objects;

public class AppUtils {

    public static User getCurrentUser(){
        return (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
    }
}
