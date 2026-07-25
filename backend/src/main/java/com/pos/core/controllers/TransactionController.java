package com.pos.core.controllers;

import com.pos.core.dtos.ReimburseRequestDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;
import com.pos.core.services.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponseDTO createTransaction(@Valid @RequestBody TransactionRequestDTO request) {
        return transactionService.create(request);
    }

    @GetMapping
    public List<TransactionResponseDTO> listTransactions(@RequestParam UUID storeId) {
        return transactionService.list(storeId);
    }

    @GetMapping("/{id}")
    public TransactionResponseDTO getTransaction(@PathVariable UUID id) {
        return transactionService.get(id);
    }

    @PostMapping("/{id}/reimburse")
    public TransactionResponseDTO reimburseTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) ReimburseRequestDTO request
    ) {
        return transactionService.reimburse(id, request != null ? request : new ReimburseRequestDTO(null));
    }
}
