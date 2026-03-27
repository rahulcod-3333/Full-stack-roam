package com.example.AirBnb_Project.repository;

import com.example.AirBnb_Project.entity.Booking;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPaymentSessionId(String sessionId);

    List<Booking> findByHotelId(Long hotelId);

    List<Booking> findByHotelIdAndCreatedATBetween(Long hotelId, LocalDateTime startDate, LocalDateTime endDate);

    List<Booking> findByUser(User user);

    List<Booking> findByBookingStatusAndCreatedATBefore(BookingStatus bookingStatus, LocalDateTime tenMinutesAgo);
}
