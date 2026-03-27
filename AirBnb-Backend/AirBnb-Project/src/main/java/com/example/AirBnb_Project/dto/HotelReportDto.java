package com.example.AirBnb_Project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

//   this is what we are doing for the dashboard functionality visible by only the admin
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HotelReportDto {
    private Long bookingCounts;
    private BigDecimal avgRevenuePerBooking;
    private BigDecimal totalRevenue;

}
