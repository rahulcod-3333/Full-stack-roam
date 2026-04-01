package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.advice.ResourceNotFoundException;
import com.example.AirBnb_Project.dto.HotelDto;
import com.example.AirBnb_Project.dto.RoomDto;
import com.example.AirBnb_Project.entity.Hotel;
import com.example.AirBnb_Project.entity.Room;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.exception.ResourceNotFound;
import com.example.AirBnb_Project.exception.UnAuthorizeException;
import com.example.AirBnb_Project.repository.HotelRepository;
import com.example.AirBnb_Project.repository.InventoryRepository;
import com.example.AirBnb_Project.repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final InventoryRepository inventoryRepository;
    private final ModelMapper mapper;
    private final InventoryService inventoryService;
    @Override
    @Transactional
    public RoomDto createNewRoom(RoomDto roomDto, Long hotelId) {
        log.info("creating new hotel with id"+hotelId);
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(()->
                new ResourceNotFound("hotel with this id is not found"+hotelId));
        User user = (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        if(user.getId() !=hotel.getOwner().getId()){
            throw new UnAuthorizeException("user with this id is not found ");
        }

        Room room = mapper.map(roomDto , Room.class);
        room.setHotel(hotel);
        roomRepository.save(room);
        if (hotel.getIsActive()){
            inventoryService.initializeRoomForAYear(room);
        }
        return mapper.map(room , RoomDto.class);
    }

    @Override
    public List<RoomDto> getAllRoomsInHotel(Long hotelId) {
        log.info("getting all rooms in hotel with id {}", hotelId);
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(()->
                new ResourceNotFound("hotel with this id is not found"+hotelId));

        return hotel.getRooms()
                .stream()
                .map((x)-> mapper.map(x, RoomDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public RoomDto getRoomById(Long roomId) {
        log.info("Getting the room with ID: {}", roomId);
        Room room = roomRepository
                .findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: "+roomId));
        return mapper.map(room, RoomDto.class);    }

    @Override
    public void deleteRoomById(Long roomId) {
        log.info("Deleting the room with ID: {}", roomId);
        Room room = roomRepository
                .findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: "+roomId));
        User user = (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        if(!user.equals(room.getHotel().getOwner())){
            throw new UnAuthorizeException("user with this id is not found ");
        }

        inventoryService.deleteAllInventories(room);
        roomRepository.deleteById(roomId);
    }

    @Override
    public RoomDto updateRoomById(Long hotelId, Long roomId, RoomDto roomDto) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(()->
                new ResourceNotFound("hotel with this id is not found"+hotelId));
        User user = (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        if(Objects.requireNonNull(user).getId() !=hotel.getOwner().getId()){
            throw new UnAuthorizeException("user with this id is not found ");
        }
        Room room = roomRepository.findById(roomId).orElseThrow(()-> new ResourceNotFoundException("hotel with this id is no found"));
        room.setId(roomId);

        RoomDto savedRoom = inventoryService.saveRoomInTheInv(room , roomId);
        roomRepository.save(room);
        return mapper.map(room, RoomDto.class);

    }

    @Override
    public List<RoomDto> getAllRoomsHomePage() {
        List<Room> rooms = roomRepository.findAll();
        return rooms.stream().map(x -> mapper.map(x , RoomDto.class)).collect(Collectors.toList());
    }

}
