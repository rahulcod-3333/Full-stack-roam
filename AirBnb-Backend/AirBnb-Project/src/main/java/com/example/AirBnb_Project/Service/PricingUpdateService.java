package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.entity.Hotel;
import com.example.AirBnb_Project.entity.HotelMinPrice;
import com.example.AirBnb_Project.entity.Inventory;
import com.example.AirBnb_Project.repository.HotelMinPriceRepository;
import com.example.AirBnb_Project.repository.HotelRepository;
import com.example.AirBnb_Project.repository.InventoryRepository;
import com.example.AirBnb_Project.strategy.PricingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PricingUpdateService {
    private final HotelRepository hotelRepository;
    private final InventoryRepository inventoryRepository;
    private final HotelMinPriceRepository hotelMinPriceRepository;
    private final PricingService pricingService;
    @Scheduled(cron = "0 0 0 * * *")
    public void updatePrices(){
        int page =0;
        int batchSize = 100;

        while(true){
            Page<Hotel> hotelPage = hotelRepository.findAll(PageRequest.of(page, batchSize));
            if(hotelPage.isEmpty()){
                break;
            }
            hotelPage.getContent().forEach(this::updateHotelPrices);
            page++;
        }
    }

    public void updateHotelPrices(Hotel hotel ){
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusYears(1);
        List<Inventory> inventoryList = inventoryRepository.findByHotelAndDateBetween(hotel, startDate, endDate);

        updateInventoryPrices(inventoryList);
        updateHotelMinPrice(hotel, inventoryList, startDate, endDate);

    }

    public void updateHotelMinPrice(Hotel hotel , List<Inventory> inventoryList , LocalDate startDate , LocalDate endDate ){
        Map<LocalDate , BigDecimal> dailyMinPrice = inventoryList.stream()
                .collect(Collectors.groupingBy(
                        Inventory::getDate,
                        Collectors.mapping(Inventory::getPrice ,Collectors.minBy(Comparator.naturalOrder()) )
                ))
                .entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e->e.getValue().orElse(BigDecimal.ZERO)));
        // Prepare hotelPrice entities in bulk
        List<HotelMinPrice> hotelPrice = new ArrayList<>();
        dailyMinPrice.forEach((date , price)->{
            HotelMinPrice hotelMinPrice = hotelMinPriceRepository.findByHotelAndDate(hotel, date )
                    .orElse(new HotelMinPrice(hotel, date ));
            hotelMinPrice.setPrice(price);
            hotelPrice.add(hotelMinPrice);
        });


    }
    private void updateInventoryPrices(List<Inventory> inventoryList) {
        for (Inventory inv : inventoryList) {
            BigDecimal dynamicPrice = pricingService.calculateDynamicPricing(inv);
            inv.setPrice(dynamicPrice);
        }
        inventoryRepository.saveAll(inventoryList);
    }
}
