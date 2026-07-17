package com.pos.customers.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CreditLimitExceededException extends RuntimeException {

    public CreditLimitExceededException(String message) {
        super(message);
    }
}
