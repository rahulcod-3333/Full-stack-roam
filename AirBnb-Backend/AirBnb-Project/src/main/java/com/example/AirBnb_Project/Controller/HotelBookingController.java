package com.example.AirBnb_Project.Controller;

import com.example.AirBnb_Project.Service.BookingService;
import com.example.AirBnb_Project.dto.BookingDto;
import com.example.AirBnb_Project.dto.BookingRequest;
import com.example.AirBnb_Project.dto.GuestDto;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class HotelBookingController {
    private final BookingService bookingService;
    @PostMapping("/init")
    public ResponseEntity<BookingDto> initialBookings(@RequestBody BookingRequest bookingRequest){
        return ResponseEntity.ok(bookingService.initialiseBookings(bookingRequest));
    }
    @PostMapping("/addGuests/{bookingId}")
    public ResponseEntity<BookingDto> addGuests(@PathVariable Long bookingId , @RequestBody List<GuestDto> guestDtoList){
        return ResponseEntity.ok(bookingService.addAllGuests(bookingId, guestDtoList));
    }
    @PostMapping("/{bookingId}/payment")
    public ResponseEntity<Map<String, String>> initiatePayments(@PathVariable Long bookingId) throws StripeException {
        String sessionUrl= bookingService.initiatePayments(bookingId);
        return ResponseEntity.ok(Map.of("SessionURl" , sessionUrl));
    }
    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable Long bookingId) throws StripeException {
        bookingService.cancelBooking(bookingId);
        return ResponseEntity.noContent().build();

    }
    @GetMapping("/{bookingId}/show")
    public ResponseEntity<Map<String , String>> showBookingResult(@PathVariable Long bookingId){
        return ResponseEntity.ok(Map.of("your booking status:", bookingService.showStatus(bookingId)));
    }


}
