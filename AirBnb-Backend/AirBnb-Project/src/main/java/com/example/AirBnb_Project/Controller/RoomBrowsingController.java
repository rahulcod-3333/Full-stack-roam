package com.example.AirBnb_Project.Controller;

import com.example.AirBnb_Project.Service.RoomService;
import com.example.AirBnb_Project.dto.RoomDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;


@Controller
@RequestMapping("/allRooms")
@RequiredArgsConstructor
public class RoomBrowsingController {
    private final RoomService roomService;
    @GetMapping
    public ResponseEntity<List<RoomDto>> getAllRoomsInHomePage() {
        return ResponseEntity.ok(roomService.getAllRoomsHomePage());
    }
}
