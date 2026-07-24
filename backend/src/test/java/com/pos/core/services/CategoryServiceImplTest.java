package com.pos.core.services;

import com.pos.core.dtos.CategoryDTO;
import com.pos.core.dtos.CategoryRequestDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.Category;
import com.pos.core.repositories.CategoryRepository;
import com.pos.core.repositories.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void create_persistsNameAndMargin() {
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
            return c;
        });

        CategoryDTO created = categoryService.create(
                new CategoryRequestDTO("Beverages", new BigDecimal("0.3000")));

        assertThat(created.name()).isEqualTo("Beverages");
        assertThat(created.targetMargin()).isEqualByComparingTo("0.3000");
    }

    @Test
    void delete_rejectsWhenProductsLinked() {
        UUID id = UUID.fromString("11111111-1111-1111-1111-111111111111");
        Category category = new Category();
        category.setId(id);
        category.setName("Beverages");
        category.setTargetMargin(new BigDecimal("0.3000"));
        when(categoryRepository.findById(id)).thenReturn(Optional.of(category));
        when(productRepository.countByCategories_Id(id)).thenReturn(2L);

        assertThatThrownBy(() -> categoryService.delete(id))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot delete");
    }

    @Test
    void findAll_mapsDtos() {
        Category category = new Category();
        category.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        category.setName("Snacks");
        category.setTargetMargin(new BigDecimal("0.2500"));
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryDTO> all = categoryService.findAll();
        assertThat(all).hasSize(1);
        assertThat(all.get(0).name()).isEqualTo("Snacks");
        verify(categoryRepository).findAll();
    }
}
