package com.example.AirBnb_Project.strategy;

import com.example.AirBnb_Project.entity.Inventory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PricingService {

    public BigDecimal calculateDynamicPricing(Inventory inventory){
        Pricingstrategy pricingstrategy= new BasePricingStrategy();

        pricingstrategy = new HolidayPricingStrategy(pricingstrategy);
        pricingstrategy = new OccupancyPricingStrategy(pricingstrategy);
        pricingstrategy = new UrgencyPricingStrategy(pricingstrategy);
        pricingstrategy = new SurgePriceStrategy(pricingstrategy);

        return pricingstrategy.calculatePrice(inventory);

    }


}