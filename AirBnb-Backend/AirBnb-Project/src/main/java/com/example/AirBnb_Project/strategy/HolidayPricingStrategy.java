package com.example.AirBnb_Project.strategy;

import com.example.AirBnb_Project.entity.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.Serial;
import java.math.BigDecimal;

@RequiredArgsConstructor
public class HolidayPricingStrategy implements Pricingstrategy{

    private final Pricingstrategy wrapped;
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        BigDecimal price = wrapped.calculatePrice(inventory);
        boolean isTodayHoliday = true;// make 3rd party api call
        if(!isTodayHoliday){
            price=price.multiply(BigDecimal.valueOf(1.25));
        }
        return price;
    }
}
