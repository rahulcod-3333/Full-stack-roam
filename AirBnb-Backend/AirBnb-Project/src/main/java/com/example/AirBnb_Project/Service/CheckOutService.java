package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.entity.Booking;
import com.stripe.exception.StripeException;

public interface CheckOutService {
    String getCheckOutSession(Booking booking, String successUrl , String failureUrl) throws StripeException;
}
