package com.pos.core.pricing;

import com.pos.core.exception.BusinessRuleException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.Map;

/**
 * Shared margin / unit-conversion helpers for Features 050–052.
 */
public final class ProductPricing {

    public static final int MONEY_SCALE = 4;
    public static final RoundingMode MONEY_ROUNDING = RoundingMode.HALF_UP;

    /** Grams (or ml) per kilogram (or liter) for mass/volume conversion. */
    private static final BigDecimal PER_KILO = new BigDecimal("1000");

    private ProductPricing() {
    }

    public static BigDecimal scaleMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }

    public static void assertValidMargin(BigDecimal targetMargin) {
        if (targetMargin == null) {
            throw new BusinessRuleException("targetMargin is required");
        }
        if (targetMargin.compareTo(BigDecimal.ONE) >= 0) {
            throw new BusinessRuleException("targetMargin must be less than 1.0000");
        }
        if (targetMargin.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("targetMargin cannot be negative");
        }
    }

    /** sellingPrice = costPrice / (1 - targetMargin). */
    public static BigDecimal sellingPriceFromMargin(BigDecimal costPrice, BigDecimal targetMargin) {
        if (costPrice == null) {
            throw new BusinessRuleException("costPrice is required to calculate sellingPrice from margin");
        }
        assertValidMargin(targetMargin);
        BigDecimal divisor = BigDecimal.ONE.subtract(targetMargin);
        if (divisor.compareTo(BigDecimal.ZERO) == 0) {
            throw new BusinessRuleException("targetMargin of 1.0000 would divide by zero");
        }
        return costPrice.divide(divisor, MONEY_SCALE, MONEY_ROUNDING);
    }

    /** margin = 1 - (cost / sellingPrice). */
    public static BigDecimal marginFromCostAndPrice(BigDecimal costPrice, BigDecimal sellingPrice) {
        if (costPrice == null || sellingPrice == null) {
            throw new BusinessRuleException("costPrice and sellingPrice are required to calculate margin");
        }
        if (sellingPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("sellingPrice must be greater than zero to calculate margin");
        }
        if (costPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("costPrice cannot be negative");
        }
        BigDecimal ratio = costPrice.divide(sellingPrice, MONEY_SCALE + 4, MONEY_ROUNDING);
        BigDecimal margin = BigDecimal.ONE.subtract(ratio).setScale(MONEY_SCALE, MONEY_ROUNDING);
        if (margin.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("sellingPrice must be >= costPrice for positive margin");
        }
        if (margin.compareTo(BigDecimal.ONE) >= 0) {
            throw new BusinessRuleException("computed margin must be less than 1.0000");
        }
        return margin;
    }

    /**
     * If {@code current} is null and both prices are positive with cost &le; selling,
     * return derived margin; otherwise return {@code current} unchanged (including null).
     */
    public static BigDecimal backfillTargetMargin(BigDecimal cost, BigDecimal selling, BigDecimal current) {
        if (current != null) {
            return current;
        }
        if (cost == null || selling == null) {
            return null;
        }
        if (cost.compareTo(BigDecimal.ZERO) <= 0 || selling.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        if (cost.compareTo(selling) > 0) {
            return null;
        }
        return marginFromCostAndPrice(cost, selling);
    }

    /**
     * Child unit cost from parent package cost.
     * Same unit: parentCost / qtyPerPackage.
     * kg parent → gr child: (parentCost / qty) / 1000.
     */
    public static BigDecimal childCostFromParent(
            BigDecimal parentCost,
            BigDecimal qtyPerPackage,
            String parentPackageUnit,
            String childSellUnit
    ) {
        if (parentCost == null) {
            throw new BusinessRuleException("Parent costPrice is required to derive child cost");
        }
        if (qtyPerPackage == null || qtyPerPackage.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Parent qtyPerPackage must be greater than zero");
        }
        BigDecimal perPackageUnit = parentCost.divide(qtyPerPackage, MONEY_SCALE + 4, MONEY_ROUNDING);
        BigDecimal factor = conversionFactor(parentPackageUnit, childSellUnit);
        return perPackageUnit.multiply(factor).setScale(MONEY_SCALE, MONEY_ROUNDING);
    }

    /**
     * Convert quantity from {@code fromUnit} into {@code toUnit} (same dimension).
     * Returns amount in {@code toUnit}.
     */
    public static BigDecimal convertQuantity(BigDecimal quantity, String fromUnit, String toUnit) {
        if (quantity == null) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        }
        BigDecimal factor = conversionFactor(fromUnit, toUnit);
        return quantity.multiply(factor).setScale(MONEY_SCALE, MONEY_ROUNDING);
    }

    /**
     * Factor to multiply a value measured in {@code fromUnit} to express it in {@code toUnit}.
     * E.g. kg → gr: 1000; gr → kg: 0.001; same unit: 1.
     */
    public static BigDecimal conversionFactor(String fromUnit, String toUnit) {
        String from = normalizeUnit(fromUnit);
        String to = normalizeUnit(toUnit);
        if (from.equals(to)) {
            return BigDecimal.ONE;
        }
        BigDecimal fromInBase = toBaseFactor(from);
        BigDecimal toInBase = toBaseFactor(to);
        if (fromInBase == null || toInBase == null || !sameFamily(from, to)) {
            throw new BusinessRuleException(
                    "Cannot convert units from '" + fromUnit + "' to '" + toUnit + "'");
        }
        return fromInBase.divide(toInBase, MONEY_SCALE + 4, MONEY_ROUNDING);
    }

    private static boolean sameFamily(String a, String b) {
        return massFamily(a) && massFamily(b) || volumeFamily(a) && volumeFamily(b) || countFamily(a) && countFamily(b);
    }

    private static boolean massFamily(String u) {
        return u.equals("kg") || u.equals("gr") || u.equals("g") || u.equals("lb");
    }

    private static boolean volumeFamily(String u) {
        return u.equals("l") || u.equals("lt") || u.equals("ml");
    }

    private static boolean countFamily(String u) {
        return u.equals("unit") || u.equals("bottle") || u.equals("ea") || u.equals("each") || u.equals("pc") || u.equals("pza");
    }

    /**
     * Parent package unit is piece/count {@code pc} (Feature 097).
     * Also accepts {@code pza} as a common Spanish label for the same chip.
     */
    public static boolean isPiecePackageUnit(String unit) {
        if (unit == null || unit.isBlank()) {
            return false;
        }
        String n = normalizeUnit(unit);
        return "pc".equals(n) || "pza".equals(n);
    }

    /** Factor: 1 of this unit = N base units (gr for mass, ml for volume, 1 for count). */
    private static BigDecimal toBaseFactor(String unit) {
        return switch (unit) {
            case "kg" -> PER_KILO;
            case "gr", "g" -> BigDecimal.ONE;
            case "lb" -> new BigDecimal("453.592");
            case "l", "lt" -> PER_KILO;
            case "ml" -> BigDecimal.ONE;
            case "unit", "bottle", "ea", "each", "pc", "pza" -> BigDecimal.ONE;
            default -> null;
        };
    }

    private static String normalizeUnit(String unit) {
        if (unit == null || unit.isBlank()) {
            return "unit";
        }
        return unit.trim().toLowerCase(Locale.ROOT);
    }

    public static BigDecimal readStoreDefaultMargin(Map<String, Object> preferences) {
        if (preferences == null || !preferences.containsKey("default_margin")) {
            return null;
        }
        Object raw = preferences.get("default_margin");
        if (raw == null) {
            return null;
        }
        try {
            BigDecimal margin = new BigDecimal(raw.toString());
            assertValidMargin(margin);
            return margin.setScale(MONEY_SCALE, MONEY_ROUNDING);
        } catch (NumberFormatException ex) {
            throw new BusinessRuleException("preferences.default_margin must be a number");
        }
    }
}
