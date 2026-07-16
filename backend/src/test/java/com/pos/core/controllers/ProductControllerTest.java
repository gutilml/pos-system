package com.pos.core.controllers;

import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.services.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Test
    void listProducts_returns200() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.findAll()).thenReturn(List.of(
                new ProductDTO(id, "SKU-1", "Cola", null, new BigDecimal("1.0000"), new BigDecimal("1.9900"), true, List.of())
        ));

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("SKU-1"))
                .andExpect(jsonPath("$[0].sellingPrice").value(1.9900));
    }

    @Test
    void createProduct_returns201() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.create(any(ProductRequestDTO.class))).thenReturn(
                new ProductDTO(id, "SKU-1", "Cola", null, new BigDecimal("1.0000"), new BigDecimal("1.9900"), true, List.of())
        );

        String body = """
                {
                  "sku": "SKU-1",
                  "name": "Cola",
                  "costPrice": 1.0000,
                  "sellingPrice": 1.9900
                }
                """;

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.sku").value("SKU-1"));
    }

    @Test
    void getProduct_returns404WhenMissing() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.findById(id)).thenThrow(new ResourceNotFoundException("Product not found: " + id));

        mockMvc.perform(get("/api/v1/products/" + id))
                .andExpect(status().isNotFound());
    }
}
