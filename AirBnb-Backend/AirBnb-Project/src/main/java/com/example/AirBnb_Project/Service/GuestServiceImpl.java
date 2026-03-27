package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.dto.GuestDto;
import com.example.AirBnb_Project.entity.Guests;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.repository.GuestRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.example.AirBnb_Project.util.AppUtils.getCurrentUser;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuestServiceImpl implements GuestService{
    private final GuestRepository guestRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<GuestDto> getAllGuests() {
        User user = getCurrentUser();
        log.info("Fetching all guests of user with id: {}", user.getId());
        List<Guests> guests = guestRepository.findByUser(user);
        return guests.stream()
                .map(guest -> modelMapper.map(guest, GuestDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public GuestDto addNewGuest(GuestDto guestDto) {
        log.info("Adding new guest: {}", guestDto);
        User user = getCurrentUser();
        Guests guest = modelMapper.map(guestDto, Guests.class);
        guest.setUser(user);
        Guests savedGuest = guestRepository.save(guest);
        log.info("Guest added with ID: {}", savedGuest.getId());
        return modelMapper.map(savedGuest, GuestDto.class);
    }

    @Override
    public void updateGuest(Long guestId, GuestDto guestDto) {
        log.info("Updating guest with ID: {}", guestId);
        Guests guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new EntityNotFoundException("Guest not found"));

        User user = getCurrentUser();
        if(!user.equals(guest.getUser())) throw new AccessDeniedException("You are not the owner of this guest");

        modelMapper.map(guestDto, guest);
        guest.setUser(user);
        guest.setId(guestId);

        guestRepository.save(guest);
        log.info("Guest with ID: {} updated successfully", guestId);
    }

    @Override
    public void deleteGuest(Long guestId) {
        log.info("Deleting guest with ID: {}", guestId);
        Guests guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new EntityNotFoundException("Guest not found"));

        User user = getCurrentUser();
        if(!user.equals(guest.getUser())) throw new AccessDeniedException("You are not the owner of this guest");

        guestRepository.deleteById(guestId);
        log.info("Guest with ID: {} deleted successfully", guestId);
    }
}
