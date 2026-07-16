package com.pos.core.services;

import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    List<ProductDTO> findAll();

    ProductDTO findById(UUID id);

    ProductDTO create(ProductRequestDTO request);
}
