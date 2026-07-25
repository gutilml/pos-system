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
  | 'login.invalidCredentials'
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
  | 'common.cancel'
  | 'workspace.navAria'
  | 'workspace.sell'
  | 'workspace.products'
  | 'workspace.customers'
  | 'workspace.inventory'
  | 'workspace.comingSoon'
  | 'products.subNavAria'
  | 'products.lookupLabel'
  | 'products.lookupPlaceholder'
  | 'products.lookupHint'
  | 'products.lookupSubmit'
  | 'products.creatingFromLookup'
  | 'products.editingFromLookup'
  | 'cashier.catalog'
  | 'admin.title'
  | 'admin.productsTab'
  | 'admin.categoriesTab'
  | 'admin.newProduct'
  | 'admin.filterProducts'
  | 'admin.noProducts'
  | 'admin.noBarcode'
  | 'admin.name'
  | 'admin.description'
  | 'admin.barcodes'
  | 'admin.barcodesHint'
  | 'admin.category'
  | 'admin.none'
  | 'admin.sellByWeight'
  | 'admin.active'
  | 'admin.unitOfMeasure'
  | 'admin.parentProduct'
  | 'admin.qtyPerPackage'
  | 'admin.packageUnit'
  | 'admin.unit.pc'
  | 'admin.unit.kg'
  | 'admin.unit.g'
  | 'admin.unit.lb'
  | 'admin.unit.L'
  | 'admin.unit.ml'
  | 'admin.cost'
  | 'admin.marginPct'
  | 'admin.retail'
  | 'admin.wholesale'
  | 'admin.inventory'
  | 'admin.trackInventory'
  | 'admin.stock'
  | 'admin.minStock'
  | 'admin.save'
  | 'admin.loadFailed'
  | 'admin.saveFailed'
  | 'admin.parentPackageTitle'
  | 'admin.parentPackageHint'
  | 'admin.parentPackageInvalid'
  | 'admin.newCategory'
  | 'admin.editCategory'
  | 'admin.noCategories'
  | 'admin.categoryInvalid'
  | 'admin.delete'
  | 'customers.new'
  | 'customers.edit'
  | 'customers.filter'
  | 'customers.filterPlaceholder'
  | 'customers.none'
  | 'customers.noPhone'
  | 'customers.selectHint'
  | 'customers.name'
  | 'customers.phone'
  | 'customers.creditLimit'
  | 'customers.hasCredit'
  | 'customers.cannotDisableCreditWithBalance'
  | 'customers.balance'
  | 'customers.ledger'
  | 'customers.ledgerEmpty'
  | 'customers.sortNewest'
  | 'customers.sortOldest'
  | 'customers.payAmount'
  | 'customers.pay'
  | 'customers.paying'
  | 'customers.payModalTitle'
  | 'customers.payMethod'
  | 'customers.payExceedsBalance'
  | 'customers.saving'
  | 'customers.nameRequired'
  | 'customers.loadFailed'
  | 'customers.saveFailed'
  | 'customers.deleteFailed'
  | 'customers.deleteConfirm'
  | 'customers.ledgerFailed'
  | 'customers.payFailed'
  | 'customers.payAmountInvalid'
  | 'inventory.filter'
  | 'inventory.filterPlaceholder'
  | 'inventory.lowStockOnly'
  | 'inventory.lowStock'
  | 'inventory.none'
  | 'inventory.stock'
  | 'inventory.adjust'
  | 'inventory.receive'
  | 'inventory.qtyAdd'
  | 'inventory.qtyDelta'
  | 'inventory.qtyInvalid'
  | 'inventory.reason'
  | 'inventory.reasonRequired'
  | 'inventory.unitCost'
  | 'inventory.selling'
  | 'inventory.wholesale'
  | 'inventory.loadFailed'
  | 'inventory.saveFailed'
  | 'inventory.saving'
  | 'inventory.readonlyBanner'
  | 'register.negativeStockWarning'

export type MessageDict = Record<MessageKey, string>

export const en: MessageDict = {
  'login.title': 'Sign in',
  'login.subtitle': 'Enter your cashier or admin credentials to open the register.',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.submitting': 'Signing in…',
  'login.missingCredentials': 'Enter username and password',
  'login.invalidCredentials': 'Invalid username or password',
  'auth.checkingSession': 'Checking session…',
  'cashier.menu': 'Cashier',
  'cashier.payIn': 'Pay in',
  'cashier.payOut': 'Pay out',
  'cashier.closeShift': 'Close Shift',
  'cashier.logOut': 'Log out',
  'cashier.loggingOut': 'Logging out…',
  'cashier.language': 'Language',
  'cashier.languageSaveFailed': 'Failed to save language',
  'cashier.catalog': 'Products & categories',
  'admin.title': 'Catalog',
  'admin.productsTab': 'Products',
  'admin.categoriesTab': 'Categories',
  'admin.newProduct': 'New product',
  'admin.filterProducts': 'Filter by name or barcode',
  'admin.noProducts': 'No products yet.',
  'admin.noBarcode': 'No barcode',
  'admin.name': 'Name',
  'admin.description': 'Description',
  'admin.barcodes': 'Barcodes',
  'admin.barcodesHint': 'One per line or comma-separated (optional)',
  'admin.category': 'Category',
  'admin.none': 'None',
  'admin.sellByWeight': 'Sell by weight / bulk',
  'admin.active': 'Active',
  'admin.unitOfMeasure': 'Unit of measure',
  'admin.parentProduct': 'Parent package product',
  'admin.qtyPerPackage': 'Qty per package',
  'admin.packageUnit': 'Package unit',
  'admin.unit.pc': 'pc',
  'admin.unit.kg': 'kg',
  'admin.unit.g': 'g',
  'admin.unit.lb': 'lb',
  'admin.unit.L': 'L',
  'admin.unit.ml': 'ml',
  'admin.cost': 'Cost',
  'admin.marginPct': 'Margin %',
  'admin.retail': 'Retail',
  'admin.wholesale': 'Wholesale',
  'admin.inventory': 'Inventory',
  'admin.trackInventory': 'Track inventory',
  'admin.stock': 'Stock',
  'admin.minStock': 'Min stock',
  'admin.save': 'Save',
  'admin.loadFailed': 'Failed to load catalog',
  'admin.saveFailed': 'Failed to save',
  'admin.parentPackageTitle': 'Complete parent package',
  'admin.parentPackageHint': 'This parent needs package qty and unit before linking.',
  'admin.parentPackageInvalid': 'Enter a qty greater than zero and a package unit',
  'admin.newCategory': 'New category',
  'admin.editCategory': 'Edit category',
  'admin.noCategories': 'No categories yet.',
  'admin.categoryInvalid': 'Enter a name and a margin between 0 and 100%',
  'admin.delete': 'Delete',
  'customers.new': 'New customer',
  'customers.edit': 'Edit customer',
  'customers.filter': 'Search customers',
  'customers.filterPlaceholder': 'Filter by name or phone',
  'customers.none': 'No customers found',
  'customers.noPhone': 'No phone',
  'customers.selectHint': 'Select a customer from the list, or create a new one.',
  'customers.name': 'Name',
  'customers.phone': 'Phone',
  'customers.creditLimit': 'Credit limit',
  'customers.hasCredit': 'Has credit',
  'customers.cannotDisableCreditWithBalance': 'Cannot turn off credit while the customer has a balance',
  'customers.balance': 'Balance',
  'customers.ledger': 'Movements',
  'customers.ledgerEmpty': 'No movements yet',
  'customers.sortNewest': 'Newest first',
  'customers.sortOldest': 'Oldest first',
  'customers.payAmount': 'Payment amount',
  'customers.pay': 'Add payment',
  'customers.paying': 'Recording…',
  'customers.payModalTitle': 'Record customer payment',
  'customers.payMethod': 'Payment method',
  'customers.payExceedsBalance': 'Amount cannot exceed the current balance',
  'customers.saving': 'Saving…',
  'customers.nameRequired': 'Name is required',
  'customers.loadFailed': 'Could not load customers',
  'customers.saveFailed': 'Could not save customer',
  'customers.deleteFailed': 'Could not delete customer',
  'customers.deleteConfirm': 'Delete this customer? This cannot be undone.',
  'customers.ledgerFailed': 'Could not load ledger',
  'customers.payFailed': 'Could not record payment',
  'customers.payAmountInvalid': 'Enter a payment amount greater than zero',
  'inventory.filter': 'Search inventory',
  'inventory.filterPlaceholder': 'Filter by name or barcode',
  'inventory.lowStockOnly': 'Low stock only',
  'inventory.lowStock': 'Low stock',
  'inventory.none': 'No inventory products found',
  'inventory.stock': 'Stock',
  'inventory.adjust': 'Adjust',
  'inventory.receive': 'Receive',
  'inventory.qtyAdd': 'Quantity to add',
  'inventory.qtyDelta': 'Quantity change (+/−)',
  'inventory.qtyInvalid': 'Enter a valid quantity',
  'inventory.reason': 'Reason',
  'inventory.reasonRequired': 'Reason is required for adjustments',
  'inventory.unitCost': 'Unit cost',
  'inventory.selling': 'Selling price',
  'inventory.wholesale': 'Wholesale price',
  'inventory.loadFailed': 'Could not load inventory',
  'inventory.saveFailed': 'Could not save stock movement',
  'inventory.saving': 'Saving…',
  'inventory.readonlyBanner': 'Inventory is disabled for this store. Viewing last stock data only.',
  'register.negativeStockWarning':
    'One or more cart lines leave stock below zero. Sale can still complete; restock soon.',
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
  'common.cancel': 'Cancel',
  'workspace.navAria': 'Workspace',
  'workspace.sell': 'Register',
  'workspace.products': 'Products',
  'workspace.customers': 'Customers',
  'workspace.inventory': 'Inventory',
  'workspace.comingSoon': 'Coming soon. This workspace will be available in a later update.',
  'products.subNavAria': 'Products sections',
  'products.lookupLabel': 'Scan or search product',
  'products.lookupPlaceholder': 'Barcode or product name',
  'products.lookupHint': 'Enter loads a match, or starts a new product if nothing is found.',
  'products.lookupSubmit': 'Find / create',
  'products.creatingFromLookup': 'New product — fill in the remaining fields, then Save.',
  'products.editingFromLookup': 'Editing product',
}

export const es: MessageDict = {
  'login.title': 'Iniciar sesión',
  'login.subtitle': 'Ingresa tus credenciales de cajero o administrador para abrir la caja.',
  'login.username': 'Usuario',
  'login.password': 'Contraseña',
  'login.submit': 'Entrar',
  'login.submitting': 'Entrando…',
  'login.missingCredentials': 'Ingresa usuario y contraseña',
  'login.invalidCredentials': 'Usuario o contraseña incorrectos',
  'auth.checkingSession': 'Verificando sesión…',
  'cashier.menu': 'Cajero',
  'cashier.payIn': 'Entrada de efectivo',
  'cashier.payOut': 'Salida de efectivo',
  'cashier.closeShift': 'Cerrar turno',
  'cashier.logOut': 'Cerrar sesión',
  'cashier.loggingOut': 'Cerrando sesión…',
  'cashier.language': 'Idioma',
  'cashier.languageSaveFailed': 'No se pudo guardar el idioma',
  'cashier.catalog': 'Productos y categorías',
  'admin.title': 'Catálogo',
  'admin.productsTab': 'Productos',
  'admin.categoriesTab': 'Categorías',
  'admin.newProduct': 'Nuevo producto',
  'admin.filterProducts': 'Filtrar por nombre o código',
  'admin.noProducts': 'Aún no hay productos.',
  'admin.noBarcode': 'Sin código',
  'admin.name': 'Nombre',
  'admin.description': 'Descripción',
  'admin.barcodes': 'Códigos de barras',
  'admin.barcodesHint': 'Uno por línea o separados por coma (opcional)',
  'admin.category': 'Categoría',
  'admin.none': 'Ninguna',
  'admin.sellByWeight': 'Venta por peso / granel',
  'admin.active': 'Activo',
  'admin.unitOfMeasure': 'Unidad de medida',
  'admin.parentProduct': 'Producto padre (paquete)',
  'admin.qtyPerPackage': 'Cant. por paquete',
  'admin.packageUnit': 'Unidad del paquete',
  'admin.unit.pc': 'pza',
  'admin.unit.kg': 'kg',
  'admin.unit.g': 'g',
  'admin.unit.lb': 'lb',
  'admin.unit.L': 'L',
  'admin.unit.ml': 'ml',
  'admin.cost': 'Costo',
  'admin.marginPct': 'Margen %',
  'admin.retail': 'Precio venta',
  'admin.wholesale': 'Mayoreo',
  'admin.inventory': 'Inventario',
  'admin.trackInventory': 'Llevar inventario',
  'admin.stock': 'Existencia',
  'admin.minStock': 'Mínimo',
  'admin.save': 'Guardar',
  'admin.loadFailed': 'No se pudo cargar el catálogo',
  'admin.saveFailed': 'No se pudo guardar',
  'admin.parentPackageTitle': 'Completar paquete padre',
  'admin.parentPackageHint': 'El padre necesita cantidad y unidad de paquete antes de vincular.',
  'admin.parentPackageInvalid': 'Ingresa una cantidad mayor que cero y una unidad',
  'admin.newCategory': 'Nueva categoría',
  'admin.editCategory': 'Editar categoría',
  'admin.noCategories': 'Aún no hay categorías.',
  'admin.categoryInvalid': 'Ingresa un nombre y un margen entre 0 y 100%',
  'admin.delete': 'Eliminar',
  'customers.new': 'Cliente nuevo',
  'customers.edit': 'Editar cliente',
  'customers.filter': 'Buscar clientes',
  'customers.filterPlaceholder': 'Filtrar por nombre o teléfono',
  'customers.none': 'No se encontraron clientes',
  'customers.noPhone': 'Sin teléfono',
  'customers.selectHint': 'Selecciona un cliente de la lista, o crea uno nuevo.',
  'customers.name': 'Nombre',
  'customers.phone': 'Teléfono',
  'customers.creditLimit': 'Límite de crédito',
  'customers.hasCredit': 'Con crédito',
  'customers.cannotDisableCreditWithBalance': 'No se puede quitar el crédito mientras el cliente tenga saldo',
  'customers.balance': 'Saldo',
  'customers.ledger': 'Movimientos',
  'customers.ledgerEmpty': 'Aún no hay movimientos',
  'customers.sortNewest': 'Más recientes',
  'customers.sortOldest': 'Más antiguos',
  'customers.payAmount': 'Monto del pago',
  'customers.pay': 'Agregar pago',
  'customers.paying': 'Registrando…',
  'customers.payModalTitle': 'Registrar pago de cliente',
  'customers.payMethod': 'Método de pago',
  'customers.payExceedsBalance': 'El monto no puede exceder el saldo actual',
  'customers.saving': 'Guardando…',
  'customers.nameRequired': 'El nombre es obligatorio',
  'customers.loadFailed': 'No se pudieron cargar los clientes',
  'customers.saveFailed': 'No se pudo guardar el cliente',
  'customers.deleteFailed': 'No se pudo eliminar el cliente',
  'customers.deleteConfirm': '¿Eliminar este cliente? Esta acción no se puede deshacer.',
  'customers.ledgerFailed': 'No se pudo cargar el historial',
  'customers.payFailed': 'No se pudo registrar el pago',
  'customers.payAmountInvalid': 'Ingresa un monto de pago mayor que cero',
  'inventory.filter': 'Buscar inventario',
  'inventory.filterPlaceholder': 'Filtrar por nombre o código',
  'inventory.lowStockOnly': 'Solo bajo stock',
  'inventory.lowStock': 'Bajo stock',
  'inventory.none': 'No se encontraron productos de inventario',
  'inventory.stock': 'Existencia',
  'inventory.adjust': 'Ajustar',
  'inventory.receive': 'Recibir',
  'inventory.qtyAdd': 'Cantidad a agregar',
  'inventory.qtyDelta': 'Cambio de cantidad (+/−)',
  'inventory.qtyInvalid': 'Ingresa una cantidad válida',
  'inventory.reason': 'Motivo',
  'inventory.reasonRequired': 'El motivo es obligatorio para ajustes',
  'inventory.unitCost': 'Costo unitario',
  'inventory.selling': 'Precio de venta',
  'inventory.wholesale': 'Precio mayoreo',
  'inventory.loadFailed': 'No se pudo cargar el inventario',
  'inventory.saveFailed': 'No se pudo guardar el movimiento',
  'inventory.saving': 'Guardando…',
  'inventory.readonlyBanner':
    'El inventario está desactivado para esta tienda. Solo se muestra la última información.',
  'register.negativeStockWarning':
    'Una o más líneas dejan el stock bajo cero. La venta puede completarse; reabastece pronto.',
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
  'common.cancel': 'Cancelar',
  'workspace.navAria': 'Áreas de trabajo',
  'workspace.sell': 'Caja',
  'workspace.products': 'Productos',
  'workspace.customers': 'Clientes',
  'workspace.inventory': 'Inventario',
  'workspace.comingSoon': 'Próximamente. Este espacio estará disponible en una actualización posterior.',
  'products.subNavAria': 'Secciones de productos',
  'products.lookupLabel': 'Escanear o buscar producto',
  'products.lookupPlaceholder': 'Código de barras o nombre',
  'products.lookupHint': 'Enter carga un producto, o inicia uno nuevo si no hay coincidencia.',
  'products.lookupSubmit': 'Buscar / crear',
  'products.creatingFromLookup': 'Producto nuevo — completa los campos restantes y guarda.',
  'products.editingFromLookup': 'Editando producto',
}

const dictionaries: Record<Locale, MessageDict> = { en, es }

export function translate(key: MessageKey, locale: Locale): string {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? key
}
