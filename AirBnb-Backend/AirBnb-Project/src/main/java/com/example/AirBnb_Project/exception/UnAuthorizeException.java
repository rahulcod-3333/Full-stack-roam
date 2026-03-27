package com.example.AirBnb_Project.exception;

public class UnAuthorizeException extends RuntimeException{
    public UnAuthorizeException(String message ){
        super(message);
    }
}
