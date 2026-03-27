package com.example.AirBnb_Project.repository;


import com.example.AirBnb_Project.dto.FavouriteDto;
import com.example.AirBnb_Project.entity.Favourite;
import com.example.AirBnb_Project.entity.Hotel;
import com.example.AirBnb_Project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavouriteRepository  extends JpaRepository<Favourite, Long> {
    Optional<Favourite> findByUserIdAndHotelId(Long userId, Long hotelId);

    List<Favourite> findByUserId(long id);
}
