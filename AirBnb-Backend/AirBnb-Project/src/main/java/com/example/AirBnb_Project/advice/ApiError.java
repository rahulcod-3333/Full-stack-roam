package com.example.AirBnb_Project.advice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ApiError {
    private HttpStatus status;
    private String message;
    private List<String> subErrors;
}
