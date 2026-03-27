package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.advice.ResourceNotFoundException;
import com.example.AirBnb_Project.dto.FavouriteDto;
import com.example.AirBnb_Project.dto.HotelDto;
import com.example.AirBnb_Project.entity.Favourite;
import com.example.AirBnb_Project.entity.Hotel;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.repository.FavouriteRepository;
import com.example.AirBnb_Project.repository.HotelRepository;
import com.example.AirBnb_Project.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.example.AirBnb_Project.util.AppUtils.getCurrentUser;

@Service
@RequiredArgsConstructor
public class FavouriteService {
    private final FavouriteRepository favouriteRepository;
    private final ModelMapper modelMapper;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<HotelDto> getAllFav() {
        User user = getCurrentUser();
        List<Favourite> fav = favouriteRepository.findByUserId(user.getId());
        return fav.stream().map(favourite -> modelMapper.map(favourite.getHotel() , HotelDto.class)).collect(Collectors.toList());
    }

    public String addFavorite(FavouriteDto request) {
        if (favouriteRepository.findByUserIdAndHotelId(request.getUserId(), request.getHotelId()).isPresent()) {
            throw new RuntimeException("Property is already in favorites.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        Favourite favorite = new Favourite();
        favorite.setUser(user);
        favorite.setHotel(hotel);
        favouriteRepository.save(favorite);

        return "Added to favorites successfully!";
    }

    public String removeFavorite(Long userId, Long hotelId) {
        Favourite favorite = (Favourite) favouriteRepository.findByUserIdAndHotelId(userId, hotelId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));


        // 2. Delete it
        favouriteRepository.delete(favorite);
        return "Removed from favorites successfully!";
    }
}
