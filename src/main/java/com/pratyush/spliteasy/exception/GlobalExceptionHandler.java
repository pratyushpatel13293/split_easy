package com.pratyush.spliteasy.exception;

import com.pratyush.spliteasy.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler( DuplicateEmailException.class )
    @ResponseStatus( HttpStatus.CONFLICT )
    public ErrorResponse handleDuplicateEmail(DuplicateEmailException ex) {
        return new ErrorResponse( HttpStatus.CONFLICT.value(), ex.getMessage() );
    }
}
