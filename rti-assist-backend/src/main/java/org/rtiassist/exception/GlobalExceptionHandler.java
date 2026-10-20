package org.rtiassist.exception;

import org.rtiassist.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse> handleApiException(ApiException ex) {
        ApiResponse response = new ApiResponse(false, ex.getCode(), ex.getMessage());
        return new ResponseEntity<>(response, ex.getStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String msg = "Validation failed";
        if (ex.getBindingResult().getFieldError() != null) {
            msg = ex.getBindingResult().getFieldError().getDefaultMessage();
        }
        ApiResponse response = new ApiResponse(false, "VALIDATION_ERROR", msg);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        ApiResponse response = new ApiResponse(false, "VALIDATION_ERROR", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGeneralException(Exception ex) {
        System.err.println("[GlobalExceptionHandler] Unexpected error: " + ex.getMessage());
        ex.printStackTrace();
        ApiResponse response = new ApiResponse(false, "SERVER_ERROR", ex.getMessage() != null ? ex.getMessage() : "An unexpected internal server error occurred");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
