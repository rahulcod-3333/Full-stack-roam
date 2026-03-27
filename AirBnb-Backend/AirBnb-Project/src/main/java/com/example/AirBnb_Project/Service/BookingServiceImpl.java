package com.example.AirBnb_Project.Service;


import com.example.AirBnb_Project.advice.ResourceNotFoundException;
import com.example.AirBnb_Project.dto.BookingDto;
import com.example.AirBnb_Project.dto.BookingRequest;
import com.example.AirBnb_Project.dto.GuestDto;
import com.example.AirBnb_Project.entity.*;
import com.example.AirBnb_Project.entity.enums.BookingStatus;
import com.example.AirBnb_Project.exception.UnAuthorizeException;
import com.example.AirBnb_Project.repository.*;
import com.example.AirBnb_Project.util.AppUtils;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;

import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.param.RefundCreateParams;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.example.AirBnb_Project.util.AppUtils.getCurrentUser;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService{

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final InventoryRepository inventoryRepository;
    private final ModelMapper mapper;
    private final GuestRepository guestRepository;
    private final CheckOutService checkOutService;


    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    @Transactional
    public BookingDto initialiseBookings(BookingRequest bookingRequest) {
        log.info("Initialising booking for hotel : {}, room: {}, date {}-{}", bookingRequest.getHotelId(),
                bookingRequest.getRoomId(), bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());

        Hotel hotel = hotelRepository.findById(bookingRequest.getHotelId()).orElseThrow(() ->
                new ResourceNotFoundException("Hotel not found with id: "+bookingRequest.getHotelId()));
        if ( !hotel.getIsActive()){
            throw new IllegalStateException("The hotel you are searching for is currently inactive");
        }
        Room room = roomRepository.findById(bookingRequest.getRoomId()).orElseThrow(() ->
                new ResourceNotFoundException("Room not found with id: "+bookingRequest.getRoomId()));

        List<Inventory> inventories = inventoryRepository.findAndLockAvailableInventory(room.getId(),bookingRequest.getCheckInDate(),bookingRequest.getCheckOutDate(), bookingRequest.getRoomsCount() );
        long daysCount = ChronoUnit.DAYS.between(bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate())+1;
        if(inventories.size()!= daysCount){
            throw new IllegalStateException("room is not available ");
        }
        // Reserve the room update the book count of the inventories
        for (Inventory inventory : inventories){
            inventory.setReservedCount(inventory.getReservedCount()+bookingRequest.getRoomsCount());
        }
    inventoryRepository.saveAll(inventories);
//
//    //create the booking
//        User user = new User();
//        user.setId(1L);// get dummy user

    //TODO : find the dynamic amount of the booking prices
        long nights = ChronoUnit.DAYS.between(bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate()) + 1;
        BigDecimal totalPrice = room.getBasePrice()
                .multiply(BigDecimal.valueOf(nights))
                .multiply(BigDecimal.valueOf(bookingRequest.getRoomsCount()));
    User user = getCurrentUser();
    Booking booking = Booking.builder()
            .bookingStatus(BookingStatus.RESERVED)
            .hotel(hotel)
            .room(room)
            .checkInDate(bookingRequest.getCheckInDate())
            .checkOutDate(bookingRequest.getCheckOutDate())
            .user(user)
            .roomsCount(bookingRequest.getRoomsCount())
            .amount(totalPrice)//TODO
            .build();

    booking = bookingRepository.save(booking);
    return mapper.map(booking, BookingDto.class);
    }

    @Transactional
    @Scheduled(fixedRate = 60000*60)
    public void releaseExpiredBookings(){
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);

        List<Booking> expiredBookings = bookingRepository.findByBookingStatusAndCreatedATBefore(BookingStatus.RESERVED ,tenMinutesAgo);

        for(Booking booking : expiredBookings){
            List<Inventory> inventoryDays = inventoryRepository.findByRoomIdAndDateBetween(booking.getRoom().getId(), booking.getCheckInDate(), booking.getCheckOutDate());

            for(Inventory days : inventoryDays){
                if(days.getReservedCount()>0){
                    days.setReservedCount(days.getReservedCount() - booking.getRoomsCount());
                }
            }
            inventoryRepository.saveAll(inventoryDays);
            bookingRepository.delete(booking);
        }


        System.out.println("cleaned Up Bookings");
    }

    @Override
    @Transactional
    public @Nullable BookingDto addAllGuests(Long bookingId, List<GuestDto> guestDtoList) {

         Booking booking = bookingRepository.findById(bookingId).orElseThrow(()-> new ResourceNotFoundException("user with this booking id is not found "));
        User user = getCurrentUser();
         if (user.getId()!=booking.getUser().getId()){
            throw new UnAuthorizeException("booking does not belong t the user wit id "+user.getId());
         }

        if(hasExpired(booking)){
            throw  new IllegalStateException("booking has already expired");
        }
        if(booking.getBookingStatus()!= BookingStatus.RESERVED){
            throw new IllegalStateException("the booking is not reserved ");
        }
        for (GuestDto guests : guestDtoList ){
             Guests guests1= mapper.map(guests, Guests.class);
             guests1.setUser(getCurrentUser());
             guests1 = guestRepository.save(guests1);
             booking.getGuests().add(guests1);
         }
        booking.setBookingStatus(BookingStatus.GUEST_ADDED);
        booking = bookingRepository.save(booking);
        return mapper.map(booking, BookingDto.class);



    }

    @Override
    public String initiatePayments(Long bookingId) throws StripeException {

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(()-> new ResourceNotFoundException("user with this booking id is not found "));
        User user = getCurrentUser();
        if (user.getId()!=booking.getUser().getId()){
            throw new UnAuthorizeException("booking does not belong to the user with id "+user.getId());
        }
        if (hasExpired(booking)){
            throw new IllegalStateException("booking has expired valid time duration is 10 mins ");

        }
        //TODO:
        String sessionUrl = checkOutService. getCheckOutSession(booking, frontendUrl+"/payments/success",frontendUrl+"/payments/failure" );

        booking.setBookingStatus(BookingStatus.PAYMENT_PENDING);
        bookingRepository.save(booking);
        return sessionUrl;
    }

    @Override
    @Transactional
    public void capturePayment(Event event) {
        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session == null) return;

            String sessionId = session.getId();
            Booking booking =
                    bookingRepository.findByPaymentSessionId(sessionId).orElseThrow(() ->
                            new ResourceNotFoundException("Booking not found for session ID: "+sessionId));

            booking.setBookingStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            inventoryRepository.findAndLockReservedInventory(booking.getRoom().getId(), booking.getCheckInDate(),
                    booking.getCheckOutDate(), booking.getRoomsCount());

            inventoryRepository.confirmBooking(booking.getRoom().getId(), booking.getCheckInDate(),
                    booking.getCheckOutDate(), booking.getRoomsCount());

            log.info("Successfully confirmed the booking for Booking ID: {}", booking.getId());
        } else {
            log.warn("Unhandled event type: {}", event.getType());
        }
    }

    @Override
    public void cancelBooking(Long bookingId) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(()-> new ResourceNotFoundException("user with this booking id is not found "));
        if (user.getId()!=booking.getUser().getId()){
            throw new UnAuthorizeException("booking does not belong to the user with id "+user.getId());
        }
        if (booking.getBookingStatus() != BookingStatus.CONFIRMED){
            throw new IllegalStateException("booking with confirmed status can be cancelled ");
        }
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        inventoryRepository.findAndLockReservedInventory(booking.getRoom().getId(), booking.getCheckInDate(),
                booking.getCheckOutDate(), booking.getRoomsCount());

        inventoryRepository.cancelBooking(booking.getRoom().getId(), booking.getCheckInDate(),
                booking.getCheckOutDate(), booking.getRoomsCount());
        //handle the refund
        try {
            Session session = Session.retrieve(booking.getPaymentSessionId());
            RefundCreateParams refundCreateParams = RefundCreateParams.builder()
                    .setPaymentIntent(session.getPaymentIntent())
                    .build();

            Refund.create(refundCreateParams);
        } catch (StripeException e) {
            throw new RuntimeException(e);
        }

    }

    @Override
    public String showStatus(Long bookingId) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(()-> new ResourceNotFoundException("user with this booking id is not found "));
        if (user.getId()!=booking.getUser().getId()){
            throw new UnAuthorizeException("booking does not belong to the user with id "+user.getId());
        }

        return booking.getBookingStatus().name();
    }

    public boolean hasExpired(Booking booking){
        return booking.getCreatedAT().plusMinutes(10).isBefore(LocalDateTime.now());
    }
    @Override
    public List<BookingDto> getMyBookings() {
        User user = getCurrentUser();

        return bookingRepository.findByUser(user)
                .stream().
                map((element) -> mapper.map(element, BookingDto.class))
                .collect(Collectors.toList());
    }



}
