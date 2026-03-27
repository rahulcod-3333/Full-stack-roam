package com.example.AirBnb_Project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = @UniqueConstraint(name = "unique_hotel_room_date"
, columnNames = {"hotel_id", "room_id" , "date"}))

@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id ;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id" , nullable = false)
    @JsonIgnore
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnore
    private Room room; // this room can have inventory on different days

    @Column(nullable = false)
    private LocalDate date ;

    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 8")
    private Integer bookedCount;

    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 8")
    private Integer reservedCount;

    @Column(nullable = false)
    private Integer totalCount;

    @Column(nullable = false , precision = 10 , scale = 2)
    private BigDecimal surgeFactor;

    @Column(nullable = false , precision = 10 , scale = 2)
    private BigDecimal price;//basePrice +surgeFActor

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private boolean closed;

    @Column(columnDefinition = "TEXT[]")
    private String[] photos;

    @Column(columnDefinition = "TEXT[]")
    private String[] amenities;

    @CreationTimestamp
    private LocalDateTime createdAT;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
