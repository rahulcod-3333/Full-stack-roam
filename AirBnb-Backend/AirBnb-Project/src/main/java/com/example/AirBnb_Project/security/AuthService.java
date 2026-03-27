package com.example.AirBnb_Project.security;

import com.example.AirBnb_Project.advice.ResourceNotFoundException;
import com.example.AirBnb_Project.dto.LoginDto;
import com.example.AirBnb_Project.dto.SignUpReqDto;
import com.example.AirBnb_Project.dto.UserDto;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.entity.enums.Roles;
import com.example.AirBnb_Project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
private final UserRepository userRepository;
private final ModelMapper mapper;
private final PasswordEncoder passwordEncoder;
private final AuthenticationManager authenticationManager;
private final JwtService jwtService;
    public UserDto signUp(SignUpReqDto signUpReqDto){
        User user = userRepository.findByEmail(signUpReqDto.getEmail()).orElse(null);

        if (user != null ){
            throw new RuntimeException("user is already present ");

        }
        User newUser = mapper.map(signUpReqDto, User.class);
        newUser.setRoles(Set.of(Roles.GUESTS));
        newUser.setPassword(passwordEncoder.encode(signUpReqDto.getPassword()));
        userRepository.save(newUser);
        return mapper.map(newUser, UserDto.class);

    }
    public String[] login (LoginDto loginDto){
        // To check if the email and password are correct or not we have to verify t via authentication manager
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));
        User user = (User) auth.getPrincipal();

        String [] arr = new String[2];
        arr[0] = jwtService.generateAccessToken(user);
        arr[1]= jwtService.generateRefreshToken(user);
        return arr;
    }
    public String refreshToken (String refreshToken){
        Long id = jwtService.getUserIdFromToken(refreshToken);

        User user= userRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("user with id is not found"));
        return jwtService.generateAccessToken(user);
    }
}
