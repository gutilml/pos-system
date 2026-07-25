package com.pos.inventory.controllers;

import com.pos.inventory.dtos.InventoryProductDTO;
import com.pos.inventory.dtos.StockMovementDTO;
import com.pos.inventory.dtos.StockMovementRequestDTO;
import com.pos.inventory.services.InventoryAdminService;
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
@RequestMapping("/api/v1/inventory")
public class InventoryController {

    private final InventoryAdminService inventoryAdminService;

    public InventoryController(InventoryAdminService inventoryAdminService) {
        this.inventoryAdminService = inventoryAdminService;
    }

    @GetMapping("/products")
    public List<InventoryProductDTO> listProducts(
            @RequestParam UUID storeId,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "false") boolean lowStockOnly
    ) {
        return inventoryAdminService.listProducts(storeId, q, lowStockOnly);
    }

    @GetMapping("/products/{id}/movements")
    public List<StockMovementDTO> listMovements(@PathVariable UUID id) {
        return inventoryAdminService.listMovements(id);
    }

    @PostMapping("/movements")
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovementDTO createMovement(@Valid @RequestBody StockMovementRequestDTO request) {
        return inventoryAdminService.createMovement(request);
    }
}
