package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.dto.BookingDto;
import com.example.AirBnb_Project.dto.HotelDto;
import com.example.AirBnb_Project.dto.HotelInfoDto;
import com.example.AirBnb_Project.dto.HotelReportDto;
import org.jspecify.annotations.Nullable;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;

public interface HotelService {
    HotelDto createNewHotel(HotelDto hotelDto);

    HotelDto getHotelByID(Long id);

    HotelDto updateById(Long hotelId, HotelDto hotelDto);

    void deleteHotelById(Long id );

    void activateHotel(Long id );

    @Nullable HotelInfoDto getHotelInfoById(Long hotelId);

     List<HotelDto> getAllHotels();

    @Nullable List<BookingDto> getAllBookingByHotelId(Long hotelId) throws AccessDeniedException;

    @Nullable HotelReportDto getHotelReport(Long hotelId, LocalDateTime startDate, LocalDateTime endDate) throws AccessDeniedException;

    List<HotelDto> getAllHotelsUser();

    List<HotelDto> searchHotels(String city);
}
