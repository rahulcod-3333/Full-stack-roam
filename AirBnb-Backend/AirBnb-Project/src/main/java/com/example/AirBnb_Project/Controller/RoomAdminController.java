package com.example.AirBnb_Project.Controller;


import com.example.AirBnb_Project.Service.RoomService;
import com.example.AirBnb_Project.dto.RoomDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/hotels/{hotelId}/rooms")
@RequiredArgsConstructor
public class RoomAdminController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<RoomDto> createNewRoom(@PathVariable Long hotelId,
                                                 @RequestBody RoomDto roomDto) {
        RoomDto room = roomService.createNewRoom(roomDto, hotelId);
        return new ResponseEntity<>(room, HttpStatus.CREATED);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomDto> getRoomById(@PathVariable Long hotelId, @PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<RoomDto> deleteRoomById(@PathVariable Long hotelId, @PathVariable Long roomId) {
        roomService.deleteRoomById(roomId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<RoomDto> updateRoomById(@PathVariable Long hotelId , @PathVariable Long roomId, @RequestBody RoomDto roomDto){
        RoomDto updatedRoom = roomService.updateRoomById(hotelId , roomId ,roomDto);
        return ResponseEntity.ok(updatedRoom);
    }

}
