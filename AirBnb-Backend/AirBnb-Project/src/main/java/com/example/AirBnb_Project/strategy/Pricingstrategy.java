package com.example.AirBnb_Project.strategy;

import com.example.AirBnb_Project.entity.Inventory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

public interface Pricingstrategy {
    BigDecimal calculatePrice(Inventory inventory
                              );
}
