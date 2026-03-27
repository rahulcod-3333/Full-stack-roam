package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.dto.BookingDto;
import com.example.AirBnb_Project.dto.BookingRequest;
import com.example.AirBnb_Project.dto.GuestDto;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import org.jspecify.annotations.Nullable;

import java.util.List;

public interface BookingService {
    public BookingDto initialiseBookings(BookingRequest bookingRequest) ;

    @Nullable BookingDto addAllGuests(Long bookingId, List<GuestDto> guestDtoList);

    String initiatePayments(Long bookingId) throws StripeException;

    void capturePayment(Event event);

    void cancelBooking(Long bookingId);

    String showStatus(Long bookingId);

    @Nullable List<BookingDto> getMyBookings();
}
