package com.example.AirBnb_Project.Controller;

import com.example.AirBnb_Project.Service.HotelService;

import com.example.AirBnb_Project.dto.BookingDto;
import com.example.AirBnb_Project.dto.HotelDto;
import com.example.AirBnb_Project.dto.HotelReportDto;
import com.example.AirBnb_Project.entity.Hotel;
import jakarta.persistence.Table;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/hotels")
@Slf4j
@RequiredArgsConstructor
@Table(name = "hotel-info")
public class HotelController {
    private final HotelService hotelService;

    @PostMapping
    public ResponseEntity<HotelDto> createHotel(@RequestBody HotelDto hotelDto){
       log.info("creating a new hotel with name {}:", hotelDto.getName());
       HotelDto hotel = hotelService.createNewHotel(hotelDto);
       return new ResponseEntity<>(hotel , HttpStatus.CREATED);
    }
    @GetMapping("/{hotelId}")
    public ResponseEntity<HotelDto> getHotelById(@PathVariable Long hotelId) {
        HotelDto hotel = hotelService.getHotelByID(hotelId);
        return new ResponseEntity<>(hotel, HttpStatus.FOUND);
    }
    @PutMapping("/{hotelId}")
    public ResponseEntity<HotelDto> updateById(@PathVariable Long hotelId , @RequestBody HotelDto hotelDto){
        HotelDto hotel = hotelService.updateById(hotelId , hotelDto);
        return ResponseEntity.ok(hotel);
    }
    @DeleteMapping("/{hotelId}")
    public ResponseEntity<Void> deleteById(@PathVariable Long hotelId ){
        hotelService.deleteHotelById(hotelId);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{hotelId}")
    public ResponseEntity<Void> activateHotel (@PathVariable Long hotelId){
        hotelService.activateHotel(hotelId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping
    public ResponseEntity<List<HotelDto>> getAllHotels(){
        return ResponseEntity.ok(hotelService.getAllHotels());
    }


    @GetMapping("/{hotelId}/bookings")
    public ResponseEntity<List<BookingDto>> getAllHotelsByBookingId(@PathVariable Long hotelId) throws AccessDeniedException {
        return ResponseEntity.ok(hotelService.getAllBookingByHotelId(hotelId));
    }

    @GetMapping("/{hotelId}/reports")
    public ResponseEntity<HotelReportDto> getAllHotelsReport (@PathVariable Long hotelId ,
                                                                    @RequestParam(required = false)
                                                                    LocalDateTime startDate , LocalDateTime endDate ) throws AccessDeniedException {
        if(startDate == null) startDate= LocalDateTime.now().minusMonths(1);
        if(endDate == null)  endDate = LocalDateTime.now();

        return ResponseEntity.ok(hotelService.getHotelReport(hotelId , startDate, endDate));
    }







}
