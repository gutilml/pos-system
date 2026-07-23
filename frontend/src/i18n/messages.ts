import type { Locale } from '@/i18n/locale'

/** Flat message keys for register chrome (Features 046–049). */
export type MessageKey =
  | 'login.title'
  | 'login.subtitle'
  | 'login.username'
  | 'login.password'
  | 'login.submit'
  | 'login.submitting'
  | 'login.missingCredentials'
  | 'auth.checkingSession'
  | 'cashier.menu'
  | 'cashier.payIn'
  | 'cashier.payOut'
  | 'cashier.closeShift'
  | 'cashier.logOut'
  | 'cashier.loggingOut'
  | 'cashier.language'
  | 'cashier.languageSaveFailed'
  | 'register.title'
  | 'register.emptyCart'
  | 'search.placeholder'
  | 'search.noProduct'
  | 'search.failed'
  | 'cart.product'
  | 'cart.qty'
  | 'cart.stock'
  | 'cart.discount'
  | 'cart.subtotal'
  | 'cart.remove'
  | 'cart.noGlobal'
  | 'footer.total'
  | 'footer.discountSaved'
  | 'footer.customer'
  | 'footer.clear'
  | 'footer.discount'
  | 'footer.pay'
  | 'footer.globalDiscountLabel'
  | 'footer.applyDiscount'
  | 'footer.cancel'
  | 'customer.change'
  | 'customer.assignTitle'
  | 'customer.assignHint'
  | 'customer.availableCredit'
  | 'customer.find'
  | 'customer.placeholder'
  | 'customer.searching'
  | 'customer.noneFound'
  | 'customer.searchFailed'
  | 'tickets.new'
  | 'tickets.newAria'
  | 'tickets.openList'
  | 'checkout.title'
  | 'checkout.grandTotal'
  | 'checkout.remaining'
  | 'checkout.tendered'
  | 'checkout.cancel'
  | 'checkout.printAndPay'
  | 'checkout.pay'
  | 'checkout.overpay'
  | 'checkout.creditGate'
  | 'checkout.abandonCredit'
  | 'checkout.failed'
  | 'tender.cash'
  | 'tender.card'
  | 'tender.credit'
  | 'shift.openTitle'
  | 'shift.startingCash'
  | 'shift.openAction'
  | 'shift.openHint'
  | 'shift.startingCashInvalid'
  | 'shift.closeTitle'
  | 'shift.closeHint'
  | 'shift.actualCash'
  | 'shift.actualCashInvalid'
  | 'shift.closing'
  | 'shift.checking'
  | 'shift.checkFailedTitle'
  | 'shift.checkFailedBody'
  | 'drawer.title'
  | 'drawer.hint'
  | 'drawer.type'
  | 'drawer.amount'
  | 'drawer.reason'
  | 'drawer.amountInvalid'
  | 'drawer.reasonRequired'
  | 'drawer.saving'
  | 'drawer.save'
  | 'weight.title'
  | 'weight.add'
  | 'weight.cancel'
  | 'weight.confirm'
  | 'weight.unit'
  | 'weight.lineTotal'
  | 'weight.readingScale'
  | 'weight.readScale'
  | 'weight.serialUnavailable'
  | 'weight.manualFallback'
  | 'weight.readFailed'
  | 'weight.backspace'
  | 'weight.decimal'
  | 'weight.inputAria'
  | 'saleTicket.title'
  | 'saleTicket.customer'
  | 'shiftTicket.title'
  | 'shiftTicket.shift'
  | 'shiftTicket.opened'
  | 'shiftTicket.closed'
  | 'shiftTicket.expectedCash'
  | 'shiftTicket.countedCash'
  | 'shiftTicket.discrepancy'
  | 'shiftTicket.overage'
  | 'shiftTicket.shortage'
  | 'shiftTicket.balanced'
  | 'shiftTicket.salesSummary'
  | 'shiftTicket.cashPayments'
  | 'shiftTicket.card'
  | 'shiftTicket.credit'
  | 'shiftTicket.salesGrandTotal'
  | 'common.loading'
  | 'common.print'
  | 'common.done'
  | 'common.retry'

export type MessageDict = Record<MessageKey, string>

export const en: MessageDict = {
  'login.title': 'Sign in',
  'login.subtitle': 'Enter your cashier or admin credentials to open the register.',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.submitting': 'Signing in…',
  'login.missingCredentials': 'Enter username and password',
  'auth.checkingSession': 'Checking session…',
  'cashier.menu': 'Cashier',
  'cashier.payIn': 'Pay in',
  'cashier.payOut': 'Pay out',
  'cashier.closeShift': 'Close Shift',
  'cashier.logOut': 'Log out',
  'cashier.loggingOut': 'Logging out…',
  'cashier.language': 'Language',
  'cashier.languageSaveFailed': 'Failed to save language',
  'register.title': 'POS Register',
  'register.emptyCart': 'Scan a barcode or search by name to start a ticket.',
  'search.placeholder': 'Scan or search products',
  'search.noProduct': 'No product found',
  'search.failed': 'Product search failed',
  'cart.product': 'Product',
  'cart.qty': 'Qty',
  'cart.stock': 'Inv',
  'cart.discount': 'Discount',
  'cart.subtotal': 'Subtotal',
  'cart.remove': 'Remove',
  'cart.noGlobal': 'No Global %',
  'footer.total': 'Total',
  'footer.discountSaved': 'Discount saved',
  'footer.customer': 'Customer',
  'footer.clear': 'Clear',
  'footer.discount': 'Discount',
  'footer.pay': 'Pay',
  'footer.globalDiscountLabel': 'Global Discount %',
  'footer.applyDiscount': 'Apply',
  'footer.cancel': 'Cancel',
  'customer.change': 'Change customer',
  'customer.assignTitle': 'Assign customer',
  'customer.assignHint': 'Attach a store-credit customer to this ticket before Pay.',
  'customer.availableCredit': 'Available credit',
  'customer.find': 'Find customer',
  'customer.placeholder': 'Name or phone',
  'customer.searching': 'Searching…',
  'customer.noneFound': 'No customers found.',
  'customer.searchFailed': 'Customer search failed',
  'tickets.new': '+ New Ticket',
  'tickets.newAria': 'New ticket',
  'tickets.openList': 'Open tickets',
  'checkout.title': 'Take payment',
  'checkout.grandTotal': 'Grand total',
  'checkout.remaining': 'Remaining',
  'checkout.tendered': 'Tendered',
  'checkout.cancel': 'Cancel',
  'checkout.printAndPay': 'Print and pay',
  'checkout.pay': 'PAY',
  'checkout.overpay': 'Amount cannot exceed remaining balance',
  'checkout.creditGate': 'Assign a customer before charging store credit.',
  'checkout.abandonCredit': 'Back — choose another tender',
  'checkout.failed': 'Checkout failed',
  'tender.cash': 'CASH',
  'tender.card': 'CARD',
  'tender.credit': 'CREDIT',
  'shift.openTitle': 'Open shift',
  'shift.startingCash': 'Starting cash',
  'shift.openAction': 'Open shift',
  'shift.openHint': 'Enter the starting cash float before using the register.',
  'shift.startingCashInvalid': 'Enter a valid starting cash amount',
  'shift.closeTitle': 'Close Shift — Blind Count',
  'shift.closeHint': 'Count the drawer and enter the actual cash total. Do not look at expected totals.',
  'shift.actualCash': 'Actual Cash',
  'shift.actualCashInvalid': 'Enter the counted cash amount',
  'shift.closing': 'Closing…',
  'shift.checking': 'Checking shift status…',
  'shift.checkFailedTitle': 'Unable to check shift',
  'shift.checkFailedBody': 'Something went wrong while loading shift status.',
  'drawer.title': 'Cash Drawer',
  'drawer.hint': 'Record cash added to or removed from the till. This updates expected cash at close.',
  'drawer.type': 'Type',
  'drawer.amount': 'Amount',
  'drawer.reason': 'Reason',
  'drawer.amountInvalid': 'Enter an amount greater than zero',
  'drawer.reasonRequired': 'Enter a reason',
  'drawer.saving': 'Saving…',
  'drawer.save': 'Save',
  'weight.title': 'Enter weight',
  'weight.add': 'Add to cart',
  'weight.cancel': 'Cancel',
  'weight.confirm': 'Confirm',
  'weight.unit': 'Unit:',
  'weight.lineTotal': 'Line total:',
  'weight.readingScale': 'Reading scale…',
  'weight.readScale': 'Read from Scale',
  'weight.serialUnavailable': 'Web Serial not available — enter weight with the keyboard or numpad.',
  'weight.manualFallback': 'Enter weight with the keyboard or numpad.',
  'weight.readFailed': 'Could not read from scale',
  'weight.backspace': 'Backspace',
  'weight.decimal': 'Decimal point',
  'weight.inputAria': 'Weight in',
  'saleTicket.title': 'Sale Ticket',
  'saleTicket.customer': 'Customer:',
  'shiftTicket.title': 'Shift Close Ticket',
  'shiftTicket.shift': 'Shift',
  'shiftTicket.opened': 'Opened',
  'shiftTicket.closed': 'Closed',
  'shiftTicket.expectedCash': 'Expected cash',
  'shiftTicket.countedCash': 'Counted cash',
  'shiftTicket.discrepancy': 'Discrepancy',
  'shiftTicket.overage': 'Overage',
  'shiftTicket.shortage': 'Shortage',
  'shiftTicket.balanced': 'Balanced',
  'shiftTicket.salesSummary': 'Sales summary',
  'shiftTicket.cashPayments': 'Cash payments',
  'shiftTicket.card': 'Card',
  'shiftTicket.credit': 'Credit (store tab)',
  'shiftTicket.salesGrandTotal': 'Sales grand total',
  'common.loading': 'Loading…',
  'common.print': 'Print',
  'common.done': 'Done',
  'common.retry': 'Retry',
}

export const es: MessageDict = {
  'login.title': 'Iniciar sesión',
  'login.subtitle': 'Ingresa tus credenciales de cajero o administrador para abrir la caja.',
  'login.username': 'Usuario',
  'login.password': 'Contraseña',
  'login.submit': 'Entrar',
  'login.submitting': 'Entrando…',
  'login.missingCredentials': 'Ingresa usuario y contraseña',
  'auth.checkingSession': 'Verificando sesión…',
  'cashier.menu': 'Cajero',
  'cashier.payIn': 'Entrada de efectivo',
  'cashier.payOut': 'Salida de efectivo',
  'cashier.closeShift': 'Cerrar turno',
  'cashier.logOut': 'Cerrar sesión',
  'cashier.loggingOut': 'Cerrando sesión…',
  'cashier.language': 'Idioma',
  'cashier.languageSaveFailed': 'No se pudo guardar el idioma',
  'register.title': 'Caja POS',
  'register.emptyCart': 'Escanea un código o busca por nombre para iniciar un ticket.',
  'search.placeholder': 'Escanear o buscar productos',
  'search.noProduct': 'Producto no encontrado',
  'search.failed': 'Error al buscar productos',
  'cart.product': 'Producto',
  'cart.qty': 'Cant.',
  'cart.stock': 'Inv',
  'cart.discount': 'Descuento',
  'cart.subtotal': 'Subtotal',
  'cart.remove': 'Quitar',
  'cart.noGlobal': 'Sin % global',
  'footer.total': 'Total',
  'footer.discountSaved': 'Descuento aplicado',
  'footer.customer': 'Cliente',
  'footer.clear': 'Limpiar',
  'footer.discount': 'Descuento',
  'footer.pay': 'Cobrar',
  'footer.globalDiscountLabel': 'Descuento global %',
  'footer.applyDiscount': 'Aplicar',
  'footer.cancel': 'Cancelar',
  'customer.change': 'Cambiar cliente',
  'customer.assignTitle': 'Asignar cliente',
  'customer.assignHint': 'Asigna un cliente con crédito de tienda a este ticket antes de cobrar.',
  'customer.availableCredit': 'Crédito disponible',
  'customer.find': 'Buscar cliente',
  'customer.placeholder': 'Nombre o teléfono',
  'customer.searching': 'Buscando…',
  'customer.noneFound': 'No se encontraron clientes.',
  'customer.searchFailed': 'Error al buscar clientes',
  'tickets.new': '+ Ticket nuevo',
  'tickets.newAria': 'Ticket nuevo',
  'tickets.openList': 'Tickets abiertos',
  'checkout.title': 'Cobrar',
  'checkout.grandTotal': 'Total general',
  'checkout.remaining': 'Restante',
  'checkout.tendered': 'Entregado',
  'checkout.cancel': 'Cancelar',
  'checkout.printAndPay': 'Imprimir y cobrar',
  'checkout.pay': 'COBRAR',
  'checkout.overpay': 'El monto no puede superar el saldo restante',
  'checkout.creditGate': 'Asigna un cliente antes de cargar crédito de tienda.',
  'checkout.abandonCredit': 'Volver — elegir otro pago',
  'checkout.failed': 'Error al cobrar',
  'tender.cash': 'EFECTIVO',
  'tender.card': 'TARJETA',
  'tender.credit': 'CRÉDITO',
  'shift.openTitle': 'Abrir turno',
  'shift.startingCash': 'Efectivo inicial',
  'shift.openAction': 'Abrir turno',
  'shift.openHint': 'Ingresa el efectivo inicial antes de usar la caja.',
  'shift.startingCashInvalid': 'Ingresa un monto de efectivo inicial válido',
  'shift.closeTitle': 'Cerrar turno — conteo a ciegas',
  'shift.closeHint': 'Cuenta el cajón e ingresa el efectivo real. No mires los totales esperados.',
  'shift.actualCash': 'Efectivo contado',
  'shift.actualCashInvalid': 'Ingresa el monto de efectivo contado',
  'shift.closing': 'Cerrando…',
  'shift.checking': 'Verificando estado del turno…',
  'shift.checkFailedTitle': 'No se pudo verificar el turno',
  'shift.checkFailedBody': 'Ocurrió un error al cargar el estado del turno.',
  'drawer.title': 'Cajón de efectivo',
  'drawer.hint': 'Registra efectivo agregado o retirado. Esto actualiza el efectivo esperado al cierre.',
  'drawer.type': 'Tipo',
  'drawer.amount': 'Monto',
  'drawer.reason': 'Motivo',
  'drawer.amountInvalid': 'Ingresa un monto mayor que cero',
  'drawer.reasonRequired': 'Ingresa un motivo',
  'drawer.saving': 'Guardando…',
  'drawer.save': 'Guardar',
  'weight.title': 'Ingresar peso',
  'weight.add': 'Agregar al carrito',
  'weight.cancel': 'Cancelar',
  'weight.confirm': 'Confirmar',
  'weight.unit': 'Unidad:',
  'weight.lineTotal': 'Total de línea:',
  'weight.readingScale': 'Leyendo báscula…',
  'weight.readScale': 'Leer de la báscula',
  'weight.serialUnavailable': 'Web Serial no disponible — ingresa el peso con el teclado o el teclado numérico.',
  'weight.manualFallback': 'Ingresa el peso con el teclado o el teclado numérico.',
  'weight.readFailed': 'No se pudo leer la báscula',
  'weight.backspace': 'Borrar',
  'weight.decimal': 'Punto decimal',
  'weight.inputAria': 'Peso en',
  'saleTicket.title': 'Ticket de venta',
  'saleTicket.customer': 'Cliente:',
  'shiftTicket.title': 'Ticket de cierre de turno',
  'shiftTicket.shift': 'Turno',
  'shiftTicket.opened': 'Apertura',
  'shiftTicket.closed': 'Cierre',
  'shiftTicket.expectedCash': 'Efectivo esperado',
  'shiftTicket.countedCash': 'Efectivo contado',
  'shiftTicket.discrepancy': 'Diferencia',
  'shiftTicket.overage': 'Sobrante',
  'shiftTicket.shortage': 'Faltante',
  'shiftTicket.balanced': 'Cuadrado',
  'shiftTicket.salesSummary': 'Resumen de ventas',
  'shiftTicket.cashPayments': 'Pagos en efectivo',
  'shiftTicket.card': 'Tarjeta',
  'shiftTicket.credit': 'Crédito (cuenta)',
  'shiftTicket.salesGrandTotal': 'Total general de ventas',
  'common.loading': 'Cargando…',
  'common.print': 'Imprimir',
  'common.done': 'Listo',
  'common.retry': 'Reintentar',
}

const dictionaries: Record<Locale, MessageDict> = { en, es }

export function translate(key: MessageKey, locale: Locale): string {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? key
}
