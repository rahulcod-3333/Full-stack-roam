package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.advice.ResourceNotFoundException;
import com.example.AirBnb_Project.dto.*;
import com.example.AirBnb_Project.entity.Booking;
import com.example.AirBnb_Project.entity.Hotel;
import com.example.AirBnb_Project.entity.Room;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.entity.enums.BookingStatus;
import com.example.AirBnb_Project.exception.ResourceNotFound;
import com.example.AirBnb_Project.exception.UnAuthorizeException;
import com.example.AirBnb_Project.repository.BookingRepository;
import com.example.AirBnb_Project.repository.HotelRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.example.AirBnb_Project.util.AppUtils.getCurrentUser;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelServiceImpl implements HotelService {

    private final ModelMapper mapper;
    private final HotelRepository hotelRepository;
    private final InventoryService inventoryService;
    private final BookingRepository bookingRepository;
    @Override
    public HotelDto createNewHotel(HotelDto hotelDto){
        log.info("Creating a new hotel with name : {}",hotelDto.getName());
        Hotel hotel = mapper.map(hotelDto , Hotel.class);
        hotel.setIsActive(false);
        if(hotel.getRooms()!=null){
            for (Room room : hotel.getRooms()){
                room.setHotel(hotel);
            }
        }
        User user = (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        hotel.setOwner(user);
        hotelRepository.save(hotel);
        log.info("created new hotel with id :{}",hotel.getId());
        return mapper.map(hotel , HotelDto.class) ;

    }
    @Override
    public HotelDto getHotelByID(Long id){
        log.info("Getting hotel with id {}:",id );
        Hotel hotel = hotelRepository.findById(id).orElseThrow(()->new ResourceNotFound("hotel with this id is not found"+id));
        User user = (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        if(!user.equals(hotel.getOwner())){
            throw new UnAuthorizeException("user with this id is not found ");
        }
        return mapper.map(hotel,HotelDto.class);
    }
    @Override
    public HotelDto updateById(Long hotelId, HotelDto hotelDto){
        log.info("updating the hotel with id :"+hotelId);
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(()-> new ResourceNotFound("hotel with this id :"+hotelId+"is not found"));
        mapper.map(hotelDto , hotel);
        //hotel has to have an id so that ..
        hotel.setId(hotelId);
        User user = (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        if(!user.equals(hotel.getOwner())){
            throw new UnAuthorizeException("user with this id is not found ");
        }
        hotel = hotelRepository.save(hotel);
        return mapper.map(hotel, HotelDto.class);
    }

    @Override
    @Transactional
    public void deleteHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFound("hotel with this id "+id+"not found "));

        User user = (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        if(!user.equals(hotel.getOwner())){
            throw new UnAuthorizeException("user with this id is not found ");
        }

        for(Room room : hotel.getRooms()) {
            inventoryService.deleteAllInventories(room);
        }

        hotelRepository.deleteById(id);
    }
    @Override
    @Transactional
    public void activateHotel(Long id) {
        log.info("activate the hotel");
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("hotel with this id " + id + "not found "));
        User user = (User) Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();
        if(user.getId()!=hotel.getOwner().getId()){
            throw new UnAuthorizeException("user with this id is not found ");
        }

        hotel.setIsActive(true);

        for (Room room : hotel.getRooms()) {
            inventoryService.initializeRoomForAYear(room);
        }
    }

    @Override
    public @Nullable HotelInfoDto getHotelInfoById(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(()-> new ResourceNotFound("hotel with this id "+hotelId+"not found "));
        List<RoomDto> rooms = hotel.getRooms()
                .stream()
                .map((room)->mapper.map(room, RoomDto.class)).toList();
        return new HotelInfoDto(mapper.map(hotel , HotelDto.class), rooms);

    }

    @Override
    public List<HotelDto> getAllHotels() {
        User user = getCurrentUser();
        List<Hotel> listOfHotels = hotelRepository.findAll();
        return List.of((HotelDto) listOfHotels);
    }

    @Override
    public @Nullable List<BookingDto> getAllBookingByHotelId(Long hotelId) throws AccessDeniedException {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(()->new ResourceNotFoundException("hotel with this id is not found "));
        User user = getCurrentUser();

        if(user.equals(hotel.getOwner())) throw new AccessDeniedException("you are not the owner of the hotel");
        List<Booking> bookings = bookingRepository.findByHotelId(hotelId);

        return bookings.stream().map((ele) ->mapper.map(ele , BookingDto.class)).collect(Collectors.toList());
    }

    @Override
    public @Nullable HotelReportDto getHotelReport(Long hotelId, LocalDateTime startDate, LocalDateTime endDate) throws AccessDeniedException {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(()->new ResourceNotFoundException("hotel with this id is not found "));
        User user = getCurrentUser();

        if(user.equals(hotel.getOwner())) throw new AccessDeniedException("you are not the owner of the hotel");
        startDate = LocalDateTime.MIN;
        endDate = LocalDateTime.MAX;
        List<Booking> bookings = bookingRepository.findByHotelIdAndCreatedATBetween(hotelId , startDate , endDate);
        Long bookingCounts = bookings.stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED)
                .count();
        BigDecimal totalRevenueOfConfirmedBooking = bookings.stream()
                .filter(booking -> booking.getBookingStatus()== BookingStatus.CONFIRMED)
                .map(Booking :: getAmount)
                .reduce(BigDecimal.ZERO ,BigDecimal::add);
        BigDecimal avgRevenuePerBooking = totalRevenueOfConfirmedBooking.intValue()==0 ?
                BigDecimal.ZERO :totalRevenueOfConfirmedBooking.divide(BigDecimal.valueOf(bookingCounts) , RoundingMode.HALF_UP.ordinal());


        return new HotelReportDto(bookingCounts , totalRevenueOfConfirmedBooking ,avgRevenuePerBooking);
    }

    @Override
    public List<HotelDto> getAllHotelsUser() {
        List<Hotel> listOfHotels = hotelRepository.findAll();
        return listOfHotels.stream().map(hotel -> mapper.map(hotel , HotelDto.class)).collect(Collectors.toList());
    }

    @Override
    public List<HotelDto> searchHotels(String city) {
        List<Hotel> hotels = hotelRepository.findByCityContainingIgnoreCase(city);

        return hotels.stream()
                .map(hotel -> mapper.map(hotel, HotelDto.class))
                .collect(Collectors.toList());
    }
    }


