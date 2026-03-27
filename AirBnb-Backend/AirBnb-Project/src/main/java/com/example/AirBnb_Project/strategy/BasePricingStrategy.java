package com.example.AirBnb_Project.strategy;

import com.example.AirBnb_Project.entity.Inventory;

import java.math.BigDecimal;

public class BasePricingStrategy implements Pricingstrategy{
    @Override
    public BigDecimal calculatePrice(Inventory inventory) {
        return inventory.getRoom().getBasePrice();
    }
}
