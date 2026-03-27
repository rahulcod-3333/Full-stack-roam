package com.example.AirBnb_Project.Service;


import com.example.AirBnb_Project.dto.RoomDto;
import com.example.AirBnb_Project.entity.Room;

import java.util.List;

public interface RoomService {

    RoomDto createNewRoom(RoomDto roomDto , Long hotelId);

    List<RoomDto> getAllRoomsInHotel(Long hotelId);

    RoomDto getRoomById(Long roomId);

    void deleteRoomById(Long roomId );

    RoomDto updateRoomById(Long hotelId , Long roomId, RoomDto roomDto);

    List<RoomDto> getAllRoomsHomePage();


}
