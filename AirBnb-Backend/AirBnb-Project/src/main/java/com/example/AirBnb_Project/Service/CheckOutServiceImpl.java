package com.example.AirBnb_Project.Service;

import com.example.AirBnb_Project.entity.Booking;
import com.example.AirBnb_Project.entity.User;
import com.example.AirBnb_Project.repository.BookingRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
@Slf4j
@RequiredArgsConstructor
public class CheckOutServiceImpl implements CheckOutService{

    private final BookingRepository bookingRepository;


    @Override
    public String getCheckOutSession(Booking booking, String successUrl, String failureUrl) throws StripeException {
        User user = (User)(SecurityContextHolder.getContext().getAuthentication()).getPrincipal();

        try {
            CustomerCreateParams customerCreateParams = CustomerCreateParams.builder()
                            .setName(user.getName())
                            .setEmail(user.getEmail())
                            .build();
                    Customer customer = Customer.create(customerCreateParams);


            SessionCreateParams sessionParams = SessionCreateParams.builder()

                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setBillingAddressCollection(SessionCreateParams.BillingAddressCollection.REQUIRED)
                    .setCustomer(customer.getId())
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(failureUrl)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("inr")
                                                    .setUnitAmount(booking.getAmount().multiply(BigDecimal.valueOf(100)).longValue())
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(booking.getHotel().getName()+":"+booking.getRoom().getType())
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()

                                    )
                                    .build();

            Session session =Session.create(sessionParams);
            /*TODO: now we will get paymentSessionID and with that we will get
                    paymentUrl
             */
            booking.setPaymentSessionId(session.getId());
            bookingRepository.save(booking);
            return session.getUrl();
        }
        catch (StripeException e ){
            throw new RuntimeException(e);
        }
    }
}
