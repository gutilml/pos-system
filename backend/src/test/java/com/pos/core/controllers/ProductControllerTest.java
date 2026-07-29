package com.pos.core.controllers;

import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.dtos.ProductSkusUpdateDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.services.ProductService;
import com.pos.testsupport.UnsecuredWebMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@UnsecuredWebMvcTest(controllers = ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    private static ProductDTO sampleProduct(UUID id) {
        return new ProductDTO(
                id,
                "SKU-1",
                "SKU-1",
                List.of("SKU-1", "SKU-ALT"),
                "Cola",
                null,
                new BigDecimal("1.0000"),
                new BigDecimal("1.9900"),
                null,
                null,
                null,
                true,
                List.of(),
                false,
                null,
                null,
                null,
                null,
                false,
                true,
                new BigDecimal("12.0000"),
                null,
                id,
                new BigDecimal("12.0000")
        );
    }

    @Test
    void listProducts_returns200() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.findAll()).thenReturn(List.of(sampleProduct(id)));

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("SKU-1"))
                .andExpect(jsonPath("$[0].primarySku").value("SKU-1"))
                .andExpect(jsonPath("$[0].skus[0]").value("SKU-1"))
                .andExpect(jsonPath("$[0].skus[1]").value("SKU-ALT"))
                .andExpect(jsonPath("$[0].sellingPrice").value(1.9900))
                .andExpect(jsonPath("$[0].sellByWeight").value(false))
                .andExpect(jsonPath("$[0].excludeFromGlobalDiscounts").value(false))
                .andExpect(jsonPath("$[0].trackInventory").value(true))
                .andExpect(jsonPath("$[0].currentStock").value(12.0000));
    }

    @Test
    void searchProducts_returnsMatches() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.search(eq("cola"))).thenReturn(List.of(sampleProduct(id)));

        mockMvc.perform(get("/api/v1/products/search").param("q", "cola"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Cola"))
                .andExpect(jsonPath("$[0].sku").value("SKU-1"))
                .andExpect(jsonPath("$[0].trackInventory").value(true))
                .andExpect(jsonPath("$[0].currentStock").value(12.0000));
    }

    @Test
    void searchProducts_returnsEmptyForBlankQuery() throws Exception {
        when(productService.search(eq("   "))).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/products/search").param("q", "   "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void createProduct_returns201() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.create(any(ProductRequestDTO.class))).thenReturn(sampleProduct(id));

        String body = """
                {
                  "skus": ["SKU-1", "SKU-ALT"],
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
                .andExpect(jsonPath("$.sku").value("SKU-1"))
                .andExpect(jsonPath("$.primarySku").value("SKU-1"));
    }

    @Test
    void replaceSkus_returnsUpdatedProduct() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.replaceSkus(eq(id), any(ProductSkusUpdateDTO.class))).thenReturn(sampleProduct(id));

        String body = """
                {
                  "skus": ["SKU-1", "SKU-ALT"]
                }
                """;

        mockMvc.perform(put("/api/v1/products/" + id + "/skus")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.skus[1]").value("SKU-ALT"));
    }

    @Test
    void replaceSkus_returns400OnBusinessRule() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.replaceSkus(eq(id), any(ProductSkusUpdateDTO.class)))
                .thenThrow(new BusinessRuleException("SKU already in use: X"));

        mockMvc.perform(put("/api/v1/products/" + id + "/skus")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"skus\":[\"X\"]}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getProduct_returns404WhenMissing() throws Exception {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        when(productService.findById(id)).thenThrow(new ResourceNotFoundException("Product not found: " + id));

        mockMvc.perform(get("/api/v1/products/" + id))
                .andExpect(status().isNotFound());
    }
}
