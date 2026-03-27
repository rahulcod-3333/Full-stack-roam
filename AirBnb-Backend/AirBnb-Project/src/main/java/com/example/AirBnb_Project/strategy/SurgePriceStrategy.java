package com.example.AirBnb_Project.strategy;

import com.example.AirBnb_Project.entity.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@RequiredArgsConstructor
public class SurgePriceStrategy implements Pricingstrategy{
    private final Pricingstrategy wrapped;
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
       BigDecimal price =  wrapped.calculatePrice(inventory);
        return price.multiply(inventory.getSurgeFactor());
    }
}
