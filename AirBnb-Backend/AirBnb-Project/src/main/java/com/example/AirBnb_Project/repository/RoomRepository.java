package com.example.AirBnb_Project.repository;

import com.example.AirBnb_Project.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room , Long> {
}
