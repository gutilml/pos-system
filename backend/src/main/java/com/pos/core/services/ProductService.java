package com.pos.core.services;

import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.dtos.ProductSkusUpdateDTO;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    List<ProductDTO> findAll();

    ProductDTO findById(UUID id);

    List<ProductDTO> search(String query);

    ProductDTO create(ProductRequestDTO request);

    ProductDTO replaceSkus(UUID productId, ProductSkusUpdateDTO request);
}
