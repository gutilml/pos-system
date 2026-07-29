package com.pos.inventory.services;

import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.Product;
import com.pos.core.models.ProductSku;
import com.pos.core.models.StoreSettings;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.inventory.dtos.InventoryProductDTO;
import com.pos.inventory.dtos.StockMovementDTO;
import com.pos.inventory.dtos.StockMovementRequestDTO;
import com.pos.inventory.models.StockMovement;
import com.pos.inventory.models.StockMovementType;
import com.pos.inventory.repositories.StockMovementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryAdminServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private StoreSettingsRepository storeSettingsRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;

    @InjectMocks
    private InventoryAdminService service;

    private StoreSettings store;
    private Product product;

    @BeforeEach
    void setUp() {
        store = new StoreSettings();
        store.setId(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"));
        Map<String, Boolean> features = new LinkedHashMap<>();
        features.put("enable_inventory", true);
        store.setFeatures(features);

        product = new Product();
        product.setId(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
        product.setName("Water");
        product.setActive(true);
        product.setTrackInventory(true);
        product.setCurrentStock(new BigDecimal("10.0000"));
        product.setLowStockThreshold(new BigDecimal("5.0000"));
        product.setCostPrice(new BigDecimal("2.0000"));
        product.setSellingPrice(new BigDecimal("4.0000"));
        product.setWholesalePrice(new BigDecimal("3.0000"));
        product.setTargetMargin(new BigDecimal("0.5000"));
        product.setWholesaleMargin(new BigDecimal("0.3333"));
    }

    @Test
    void weightedAverage_blendsOldAndIncoming() {
        BigDecimal avg = InventoryAdminService.weightedAverage(
                new BigDecimal("4.0000"),
                new BigDecimal("10.0000"),
                new BigDecimal("6.0000"),
                new BigDecimal("10.0000")
        );
        assertThat(avg).isEqualByComparingTo("5.0000");
    }

    @Test
    void listProducts_filtersLowStock() {
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        product.setCurrentStock(new BigDecimal("3.0000"));
        when(productRepository.findAll()).thenReturn(List.of(product));

        List<InventoryProductDTO> all = service.listProducts(store.getId(), "", false);
        List<InventoryProductDTO> low = service.listProducts(store.getId(), "", true);

        assertThat(all).hasSize(1);
        assertThat(low).hasSize(1);
        assertThat(low.get(0).lowStock()).isTrue();
    }

    @Test
    void listProducts_matchesSecondarySku() {
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        product.setName("Cola 355ml");

        ProductSku primary = new ProductSku();
        primary.setCode("7501000000028");
        primary.setIsPrimary(true);
        primary.setProduct(product);

        ProductSku secondary = new ProductSku();
        secondary.setCode("7501000001025");
        secondary.setIsPrimary(false);
        secondary.setProduct(product);

        product.setSkus(List.of(primary, secondary));
        when(productRepository.findAll()).thenReturn(List.of(product));

        List<InventoryProductDTO> bySecondary = service.listProducts(store.getId(), "7501000001025", false);
        List<InventoryProductDTO> byPrimary = service.listProducts(store.getId(), "7501000000028", false);
        List<InventoryProductDTO> miss = service.listProducts(store.getId(), "9999999999999", false);

        assertThat(bySecondary).hasSize(1);
        assertThat(bySecondary.get(0).name()).isEqualTo("Cola 355ml");
        assertThat(byPrimary).hasSize(1);
        assertThat(miss).isEmpty();
    }

    @Test
    void createMovement_receivingWithNewCost_blendsPrices() {
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(inv -> {
            StockMovement m = inv.getArgument(0);
            m.setId(UUID.fromString("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"));
            return m;
        });

        StockMovementDTO dto = service.createMovement(new StockMovementRequestDTO(
                store.getId(),
                product.getId(),
                StockMovementType.RECEIVING,
                new BigDecimal("10.0000"),
                null,
                new BigDecimal("4.0000"),
                null,
                null
        ));

        assertThat(product.getCurrentStock()).isEqualByComparingTo("20.0000");
        assertThat(product.getCostPrice()).isEqualByComparingTo("3.0000");
        // incoming selling = 4 / (1-0.5) = 8; blend (4*10+8*10)/20 = 6
        assertThat(product.getSellingPrice()).isEqualByComparingTo("6.0000");
        assertThat(dto.type()).isEqualTo(StockMovementType.RECEIVING);
    }

    @Test
    void createMovement_adjustmentRejectsNegativeResult() {
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> service.createMovement(new StockMovementRequestDTO(
                store.getId(),
                product.getId(),
                StockMovementType.ADJUSTMENT,
                new BigDecimal("-20.0000"),
                "theft",
                null,
                null,
                null
        ))).isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("negative");
    }

    @Test
    void createMovement_adjustmentAppliesDelta() {
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(inv -> {
            StockMovement m = inv.getArgument(0);
            m.setId(UUID.randomUUID());
            return m;
        });

        service.createMovement(new StockMovementRequestDTO(
                store.getId(),
                product.getId(),
                StockMovementType.ADJUSTMENT,
                new BigDecimal("-2.0000"),
                "broken",
                new BigDecimal("99.0000"),
                null,
                null
        ));

        assertThat(product.getCurrentStock()).isEqualByComparingTo("8.0000");
        assertThat(product.getCostPrice()).isEqualByComparingTo("2.0000");
    }

    @Test
    void createMovement_requiresInventoryEnabled() {
        store.getFeatures().put("enable_inventory", false);
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));

        assertThatThrownBy(() -> service.createMovement(new StockMovementRequestDTO(
                store.getId(),
                product.getId(),
                StockMovementType.RECEIVING,
                new BigDecimal("1.0000"),
                null,
                null,
                null,
                null
        ))).isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not enabled");
    }
}
