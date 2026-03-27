package com.example.AirBnb_Project.dto;

import com.example.AirBnb_Project.entity.Hotel;
import com.example.AirBnb_Project.entity.Room;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class InventoryDto {

    private Long id ;

    private LocalDate date ;


    private Integer bookedCount;


    private Integer reservedCount;


    private Integer totalCount;


    private BigDecimal surgeFactor;


    private BigDecimal price;//basePrice +surgeFActor


    private boolean closed;


    private LocalDateTime createdAT;


    private LocalDateTime updatedAt;

}
