package com.example.AirBnb_Project.strategy;

import com.example.AirBnb_Project.entity.Inventory;
import jdk.jfr.Registered;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@RequiredArgsConstructor
public class OccupancyPricingStrategy implements Pricingstrategy{

    private final Pricingstrategy wrapped;
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        BigDecimal price = wrapped.calculatePrice(inventory);
        double occupancy = (double) inventory.getBookedCount() /inventory.getTotalCount();
        if(occupancy>0.8){
            price = price.multiply(BigDecimal.valueOf(1.2));
        }
        return price;
    }
}
