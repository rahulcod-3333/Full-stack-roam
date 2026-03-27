package com.example.AirBnb_Project.repository;

import com.example.AirBnb_Project.entity.Guests;
import com.example.AirBnb_Project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestRepository extends JpaRepository<Guests, Long> {

    List<Guests> findByUser(User user);

}
