import type { Locale } from '@/i18n/locale'

/** Flat message keys for register chrome (Feature 046). */
export type MessageKey =
  | 'login.title'
  | 'login.subtitle'
  | 'login.username'
  | 'login.password'
  | 'login.submit'
  | 'login.submitting'
  | 'login.missingCredentials'
  | 'cashier.menu'
  | 'cashier.payIn'
  | 'cashier.payOut'
  | 'cashier.closeShift'
  | 'cashier.logOut'
  | 'cashier.loggingOut'
  | 'cashier.language'
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
  | 'checkout.title'
  | 'checkout.grandTotal'
  | 'checkout.remaining'
  | 'checkout.tendered'
  | 'checkout.cancel'
  | 'checkout.printAndPay'
  | 'checkout.pay'
  | 'checkout.addTender'
  | 'checkout.noTenders'
  | 'shift.openTitle'
  | 'shift.startingCash'
  | 'shift.openAction'
  | 'weight.title'
  | 'weight.add'
  | 'weight.cancel'
  | 'common.loading'

export type MessageDict = Record<MessageKey, string>

export const en: MessageDict = {
  'login.title': 'Sign in',
  'login.subtitle': 'Enter your cashier or admin credentials to open the register.',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.submitting': 'Signing in…',
  'login.missingCredentials': 'Enter username and password',
  'cashier.menu': 'Cashier',
  'cashier.payIn': 'Pay in',
  'cashier.payOut': 'Pay out',
  'cashier.closeShift': 'Close Shift',
  'cashier.logOut': 'Log out',
  'cashier.loggingOut': 'Logging out…',
  'cashier.language': 'Language',
  'register.title': 'POS Register',
  'register.emptyCart': 'Scan a barcode or search by name to start a ticket.',
  'search.placeholder': 'Scan or search products',
  'search.noProduct': 'No product found',
  'search.failed': 'Product search failed',
  'cart.product': 'Product',
  'cart.qty': 'Qty',
  'cart.stock': 'Stock',
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
  'checkout.title': 'Take payment',
  'checkout.grandTotal': 'Grand total',
  'checkout.remaining': 'Remaining',
  'checkout.tendered': 'Tendered',
  'checkout.cancel': 'Cancel',
  'checkout.printAndPay': 'Print and pay',
  'checkout.pay': 'PAY',
  'checkout.addTender': 'Add tender',
  'checkout.noTenders': 'No tenders yet. Add cash, card, or store credit below.',
  'shift.openTitle': 'Open shift',
  'shift.startingCash': 'Starting cash',
  'shift.openAction': 'Open shift',
  'weight.title': 'Enter weight',
  'weight.add': 'Add to cart',
  'weight.cancel': 'Cancel',
  'common.loading': 'Loading…',
}

export const es: MessageDict = {
  'login.title': 'Iniciar sesión',
  'login.subtitle': 'Ingresa tus credenciales de cajero o administrador para abrir la caja.',
  'login.username': 'Usuario',
  'login.password': 'Contraseña',
  'login.submit': 'Entrar',
  'login.submitting': 'Entrando…',
  'login.missingCredentials': 'Ingresa usuario y contraseña',
  'cashier.menu': 'Cajero',
  'cashier.payIn': 'Entrada de efectivo',
  'cashier.payOut': 'Salida de efectivo',
  'cashier.closeShift': 'Cerrar turno',
  'cashier.logOut': 'Cerrar sesión',
  'cashier.loggingOut': 'Cerrando sesión…',
  'cashier.language': 'Idioma',
  'register.title': 'Caja POS',
  'register.emptyCart': 'Escanea un código o busca por nombre para iniciar un ticket.',
  'search.placeholder': 'Escanear o buscar productos',
  'search.noProduct': 'Producto no encontrado',
  'search.failed': 'Error al buscar productos',
  'cart.product': 'Producto',
  'cart.qty': 'Cant.',
  'cart.stock': 'Stock',
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
  'checkout.title': 'Cobrar',
  'checkout.grandTotal': 'Total general',
  'checkout.remaining': 'Restante',
  'checkout.tendered': 'Entregado',
  'checkout.cancel': 'Cancelar',
  'checkout.printAndPay': 'Imprimir y cobrar',
  'checkout.pay': 'COBRAR',
  'checkout.addTender': 'Agregar pago',
  'checkout.noTenders': 'Sin pagos aún. Agrega efectivo, tarjeta o crédito abajo.',
  'shift.openTitle': 'Abrir turno',
  'shift.startingCash': 'Efectivo inicial',
  'shift.openAction': 'Abrir turno',
  'weight.title': 'Ingresar peso',
  'weight.add': 'Agregar al carrito',
  'weight.cancel': 'Cancelar',
  'common.loading': 'Cargando…',
}

const dictionaries: Record<Locale, MessageDict> = { en, es }

export function translate(key: MessageKey, locale: Locale): string {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? key
}
