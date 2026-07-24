package com.pos.core.services;

import com.pos.core.dtos.CategoryDTO;
import com.pos.core.dtos.CategoryRequestDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Category;
import com.pos.core.pricing.ProductPricing;
import com.pos.core.repositories.CategoryRepository;
import com.pos.core.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> findAll() {
        return categoryRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDTO findById(UUID id) {
        return toDto(getCategory(id));
    }

    @Override
    public CategoryDTO create(CategoryRequestDTO request) {
        ProductPricing.assertValidMargin(request.targetMargin());
        Category category = new Category();
        category.setName(request.name().trim());
        category.setTargetMargin(ProductPricing.scaleMoney(request.targetMargin()));
        return toDto(categoryRepository.save(category));
    }

    @Override
    public CategoryDTO update(UUID id, CategoryRequestDTO request) {
        ProductPricing.assertValidMargin(request.targetMargin());
        Category category = getCategory(id);
        category.setName(request.name().trim());
        category.setTargetMargin(ProductPricing.scaleMoney(request.targetMargin()));
        return toDto(categoryRepository.save(category));
    }

    @Override
    public void delete(UUID id) {
        Category category = getCategory(id);
        long linked = productRepository.countByCategories_Id(id);
        if (linked > 0) {
            throw new BusinessRuleException(
                    "Cannot delete category while " + linked + " product(s) still reference it");
        }
        categoryRepository.delete(category);
    }

    private Category getCategory(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    private CategoryDTO toDto(Category category) {
        return new CategoryDTO(category.getId(), category.getName(), category.getTargetMargin());
    }
}
