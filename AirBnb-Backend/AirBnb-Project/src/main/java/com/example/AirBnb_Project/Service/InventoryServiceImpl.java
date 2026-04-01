package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.advice.ResourceNotFoundException;
import com.example.AirBnb_Project.dto.*;
import com.example.AirBnb_Project.entity.Inventory;
import com.example.AirBnb_Project.entity.Room;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.exception.ResourceNotFound;
import com.example.AirBnb_Project.repository.HotelMinPriceRepository;
import com.example.AirBnb_Project.repository.InventoryRepository;
import com.example.AirBnb_Project.repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.example.AirBnb_Project.util.AppUtils.getCurrentUser;


@Service
@Slf4j
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ModelMapper mapper;
    private final HotelMinPriceRepository hotelMinPriceRepository;
    private final RoomRepository roomRepository;
    @Override
    @Transactional
    public void initializeRoomForAYear(Room room) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusYears(1);

        List<Inventory> inventoryList = new ArrayList<>();

        for (; !today.isAfter(endDate); today = today.plusDays(1)) {
            if (inventoryRepository.existsByRoomAndDate(room, today)) {
                continue;
            }
            Inventory inventory= Inventory.builder()
                    .hotel(room.getHotel())
                    .room(room)
                    .bookedCount(0)
                    .reservedCount(0)
                    .city(room.getHotel().getCity())
                    .date(today)
                    .price(room.getBasePrice())
                    .surgeFactor(BigDecimal.ONE)
                    .totalCount(room.getTotalCount())
                    .closed(false)
                    .build();
            inventoryList.add(inventory);

        }

        inventoryRepository.saveAll(inventoryList);
    }

    @Override
    public void deleteAllInventories(Room room) {
        log.info("deleting the inventories of room with id :"+room.getId());
        inventoryRepository.deleteByRoom(room);
    }

    @Override
    public Page<HotelPriceDto> searchHotel(HotelSearchRequest hotelSearchRequest) {
        log.info("Searching hotel for {} city, form {} to {}", hotelSearchRequest.getCity(), hotelSearchRequest.getStartAt(), hotelSearchRequest.getEndAt());
        Pageable pageable = PageRequest.of(hotelSearchRequest.getPage(), hotelSearchRequest.getSize());
        long dateCount =
                ChronoUnit.DAYS.between(hotelSearchRequest.getStartAt(), hotelSearchRequest.getEndAt())+1;

        return hotelMinPriceRepository.findHotelWithAvailableInventory(hotelSearchRequest.getCity(),hotelSearchRequest.getStartAt(),hotelSearchRequest.getEndAt(),hotelSearchRequest.getRoomsCount(),dateCount,pageable);

    }

    @Override
    public RoomDto saveRoomInTheInv(Room room , Long roomId) {
        Room roomInventory = inventoryRepository.findById(roomId).orElseThrow(()-> new ResourceNotFound("Room with this id not found "+ roomId)).getRoom();
        roomInventory.setId(room.getId());
        roomInventory.setHotel(room.getHotel());
        roomInventory.setAmenities(room.getAmenities());
        roomInventory.setCapacity(room.getCapacity());
        roomInventory.setPhotos(room.getPhotos());
        roomInventory.setBasePrice(room.getBasePrice());
        roomInventory.setCreatedAT(room.getCreatedAT());
        roomInventory.setUpdatedAt(room.getUpdatedAt());
        roomInventory.setType(room.getType());

        return mapper.map(roomInventory, RoomDto.class);
    }

    @Override
    public @Nullable List<InventoryDto> getallInventoryByRoom(Long roomId) throws AccessDeniedException {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(()-> new ResourceNotFoundException("room with the room id "+ roomId));
        User user = getCurrentUser();
        if (!user.equals(room.getHotel().getOwner())) throw new AccessDeniedException("user with this is is not authorized");

        return inventoryRepository.findByRoomOrderByDate(room).stream()
                .map((ele)-> mapper.map(ele , InventoryDto.class))
                .collect(Collectors.toList());

    }

    @Override
    @Transactional
    public void updateInventory(Long roomId, UpdateInventoryReqDto invreqDto) throws AccessDeniedException {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(()-> new ResourceNotFoundException("room with the room id "+ roomId));
        User user = getCurrentUser();
        if (!user.equals(room.getHotel().getOwner())) throw new AccessDeniedException("user with this is is not authorized");
        inventoryRepository.getInventoryLockBeforeUpdate(roomId , invreqDto.getStartDate(), invreqDto.getEndDate());
        inventoryRepository.updateInventory(roomId, invreqDto.getStartDate(), invreqDto.getEndDate(), invreqDto.isClosed(), invreqDto.getSurgeFactor());
    }
}
