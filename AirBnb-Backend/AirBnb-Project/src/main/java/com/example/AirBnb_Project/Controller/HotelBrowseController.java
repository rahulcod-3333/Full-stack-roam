package com.example.AirBnb_Project.Controller;

import com.example.AirBnb_Project.Service.HotelService;
import com.example.AirBnb_Project.Service.InventoryService;
import com.example.AirBnb_Project.dto.HotelDto;
import com.example.AirBnb_Project.dto.HotelInfoDto;
import com.example.AirBnb_Project.dto.HotelPriceDto;
import com.example.AirBnb_Project.dto.HotelSearchRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelBrowseController {

    private final InventoryService inventoryService;
    private final HotelService hotelService;
    @GetMapping("/search")
    public ResponseEntity<Page<HotelPriceDto>> searchHotels(@RequestBody HotelSearchRequest hotelSearchRequest){
        Page<HotelPriceDto> page= inventoryService.searchHotel(hotelSearchRequest);
        return ResponseEntity.ok(page);
    }
    @GetMapping("/{hotelId}/info")
    public ResponseEntity<HotelInfoDto> getHotelInfo(@PathVariable Long hotelId){
        return ResponseEntity.ok(hotelService.getHotelInfoById(hotelId));
    }
    @GetMapping("/all")
    public ResponseEntity<List<HotelDto>> getAllHotelByUser(){
        return ResponseEntity.ok(hotelService.getAllHotelsUser());

    }
    @GetMapping("/searchbar")
    public ResponseEntity<List<HotelDto>> searchHotels(@RequestParam String city){
        return ResponseEntity.ok(hotelService.searchHotels(city));
    }

}
