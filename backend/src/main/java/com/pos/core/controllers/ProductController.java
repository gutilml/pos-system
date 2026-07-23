package com.pos.core.controllers;

import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.dtos.ProductSkusUpdateDTO;
import com.pos.core.services.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductDTO> listProducts() {
        return productService.findAll();
    }

    @GetMapping("/search")
    public List<ProductDTO> searchProducts(@RequestParam(defaultValue = "") String q) {
        return productService.search(q);
    }

    @GetMapping("/{id}")
    public ProductDTO getProduct(@PathVariable UUID id) {
        return productService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDTO createProduct(@Valid @RequestBody ProductRequestDTO request) {
        return productService.create(request);
    }

    @PutMapping("/{id}/skus")
    public ProductDTO replaceProductSkus(
            @PathVariable UUID id,
            @Valid @RequestBody ProductSkusUpdateDTO request
    ) {
        return productService.replaceSkus(id, request);
    }
}
