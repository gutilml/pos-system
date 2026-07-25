package com.pos.customers.services;

import com.pos.core.models.PaymentType;
import com.pos.core.models.StoreSettings;
import com.pos.core.services.StoreSettingsServiceImpl;
import com.pos.customers.models.CreditLedgerEntryType;

/**
 * Snapshot ledger movement text in the store UI locale at write time (Feature 069).
 * Existing rows keep their stored description when the store later switches language.
 */
final class CreditLedgerLabels {

    private CreditLedgerLabels() {
    }

    static String movementDescription(
            StoreSettings store,
            CreditLedgerEntryType type,
            PaymentType paymentMethod
    ) {
        String locale = StoreSettingsServiceImpl.resolveUiLocale(store);
        boolean es = "es".equals(locale);
        String typeLabel = switch (type) {
            case CHARGE -> es ? "Cargo" : "Charge";
            case PAYMENT -> es ? "Pago" : "Payment";
        };
        if (paymentMethod == null) {
            return typeLabel;
        }
        String methodLabel = switch (paymentMethod) {
            case CASH -> es ? "Efectivo" : "Cash";
            case CARD -> es ? "Tarjeta" : "Card";
            case CREDIT -> es ? "Crédito" : "Credit";
        };
        return typeLabel + " · " + methodLabel;
    }
}
