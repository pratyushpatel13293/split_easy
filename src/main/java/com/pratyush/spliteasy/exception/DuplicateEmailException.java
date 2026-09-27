package com.pratyush.spliteasy.exception;

import com.pratyush.spliteasy.service.UserService;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
