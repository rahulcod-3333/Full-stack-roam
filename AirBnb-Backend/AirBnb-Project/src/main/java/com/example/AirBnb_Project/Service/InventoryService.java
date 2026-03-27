package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.dto.*;
import com.example.AirBnb_Project.entity.Room;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;

import java.nio.file.AccessDeniedException;
import java.util.List;

public interface InventoryService {


    void initializeRoomForAYear(Room room);

    void deleteAllInventories(Room room);

    Page<HotelPriceDto> searchHotel(HotelSearchRequest hotelSearchRequest);

    RoomDto saveRoomInTheInv(Room roomInventory , Long roomId);

    @Nullable List<InventoryDto> getallInventoryByRoom(Long roomId) throws AccessDeniedException;

    void updateInventory(Long roomId, UpdateInventoryReqDto invreqDto) throws AccessDeniedException;


//    Page<HotelDto> searchHotels(HotelSearchRequest hotelSearchRequest);
}
