package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.advice.ResourceNotFoundException;
import com.example.AirBnb_Project.dto.ProfileUpdateReqDto;
import com.example.AirBnb_Project.dto.UserDto;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Objects;

import static com.example.AirBnb_Project.util.AppUtils.getCurrentUser;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;
    private final ModelMapper mapper;
    @Override
    public User getUserId(Long id) {
        return userRepository.findById(id).orElseThrow(()->
                new ResourceNotFoundException("user with this id is not found "));
    }

    @Override
    public void updateProfile(ProfileUpdateReqDto profileUpdateReqDto) {
        User user = getCurrentUser();

        if(profileUpdateReqDto.getDateOfBirth() != null) user.setDateOfBirth(profileUpdateReqDto.getDateOfBirth());
        if(profileUpdateReqDto.getGender() != null) user.setGender(profileUpdateReqDto.getGender());
        if (profileUpdateReqDto.getName() != null) user.setName(profileUpdateReqDto.getName());

        userRepository.save(user);
    }

    @Override
    public UserDto getMyProfile() {
        User user = getCurrentUser();
        log.info("Getting the profile for user with id: {}", user.getId());
        return mapper.map(user, UserDto.class);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return Objects.requireNonNull(userRepository.findByEmail(username).orElse(null));
    }
}
