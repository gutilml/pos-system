package com.pos.core.services;

import com.pos.core.dtos.CategoryDTO;
import com.pos.core.dtos.CategoryRequestDTO;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    List<CategoryDTO> findAll();

    CategoryDTO findById(UUID id);

    CategoryDTO create(CategoryRequestDTO request);

    CategoryDTO update(UUID id, CategoryRequestDTO request);

    void delete(UUID id);
}
