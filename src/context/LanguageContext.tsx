import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { translateTexts } from "@/lib/translate";

type Language = "es" | "en" | "pt";

const sourceLabels = {
  home: "Inicio",
  catalog: "Catalogo",
  branches: "Sucursales",
  search: "Buscar productos, marcas, SKU...",
  searchShort: "Buscar...",
  signIn: "Ingresar",
  cart: "Carrito",
  profile: "Mi perfil",
  orders: "Mis compras",
  signOut: "Cerrar sesion",
  productNotFound: "Producto no encontrado",
  backToCatalog: "Volver al catalogo",
  back: "Volver",
  sku: "SKU",
  vatIncluded: "IVA incluido",
  referenceRate: "Referencia Banco Central",
  language: "Idioma",
  available: "unidades disponibles",
  outOfStock: "Sin stock",
  description: "Descripcion",
  addToCart: "Agregar al carrito",
  keepBrowsing: "Seguir explorando",
  shippingTitle: "Despacho a todo Chile",
  shippingText: "2 a 5 dias habiles",
  warrantyTitle: "Garantia oficial",
  warrantyText: "12 meses fabrica",
  pickupTitle: "Retiro en tienda",
  pickupText: "Gratis en 6 sucursales",
  finalPaymentClp: "El pago final se realiza en CLP.",
  since1985: "Distribuidora desde 1985",
  heroTitleA: "Todo para construir,",
  heroTitleB: "renovar y reparar.",
  heroCopy:
    "Herramientas, materiales electricos, pinturas y seguridad de las mejores marcas. Compra online con retiro en tienda o despacho a domicilio.",
  viewCatalog: "Ver catalogo",
  findStore: "Encuentra una sucursal",
  homeDelivery: "Despacho a domicilio",
  homeDeliveryText: "En la Region Metropolitana y regiones.",
  storePickup: "Retiro en tienda",
  storePickupText: "En cualquiera de nuestras 7 sucursales.",
  paymentMethods: "Multiples medios de pago",
  paymentMethodsText: "Debito, credito y transferencia.",
  trustedBrands: "Marcas confiables",
  trustedBrandsText: "Bosch, Makita, Stanley, Sika.",
  featuredCategories: "Categorias destacadas",
  featuredCategoriesText: "Encuentra rapidamente lo que necesitas.",
  featuredProducts: "Productos destacados",
  featuredProductsText: "Lo mas vendido esta semana.",
  viewAll: "Ver todo",
  professionalCtaTitle: "Eres profesional o constructora?",
  professionalCtaText:
    "Accede a precios mayoristas, despachos coordinados y atencion dedicada en cualquiera de nuestras sucursales.",
  contactUs: "Contactanos",
  categoryAll: "Todos",
  categoryTools: "Herramientas",
  categoryConstruction: "Construccion",
  categoryPaints: "Pinturas",
  categoryElectrical: "Electrico",
  categorySafety: "Seguridad",
  productsAvailable: "productos disponibles en linea",
  pages: "paginas",
  searchProductSkuBrand: "Buscar producto, SKU o marca...",
  noProductsFound: "No se encontraron productos.",
  showing: "Mostrando",
  of: "de",
  previous: "Anterior",
  next: "Siguiente",
  stock: "Stock",
  add: "Agregar",
  footerDescription:
    "Distribuidora de productos de ferreteria y construccion desde 1985. Calidad y servicio para profesionales y hogar.",
  store: "Tienda",
  company: "Empresa",
  ourBranches: "Nuestras sucursales",
  contact: "Contacto",
  academicDemo: "Integracion de Plataformas (ASY5131) - Demo academica",
  cartTitle: "Carrito de compras",
  cartSubtitle: "Revisa tu pedido y completa el proceso de compra.",
  securePurchase: "Compra segura",
  orderInHistory: "Tu pedido quedara disponible en tu historial de compras.",
  emptyCart: "Tu carrito esta vacio.",
  goToCatalog: "Ir al catalogo",
  contactData: "Datos de contacto",
  edit: "Editar",
  name: "Nombre",
  email: "Email",
  phone: "Telefono",
  rut: "RUT",
  delivery: "Entrega",
  homeShipping: "Despacho a domicilio",
  free: "Gratis",
  pickupBranch: "Sucursal de retiro",
  paymentMethod: "Metodo de pago",
  bankTransfer: "Transferencia bancaria",
  bankTransferText: "Registra el pedido y deja el pago pendiente de confirmacion manual.",
  webpayText: "Pago seguro con debito o credito en la pasarela oficial de Transbank.",
  secureWebpayNote:
    "Las tarjetas ya no se procesan dentro de esta app. El cobro se realiza en Webpay Plus para cumplir un flujo mas seguro y compatible con Transbank.",
  internationalPurchase: "Compra internacional",
  internationalPurchaseText: "Muestra una referencia en moneda extranjera usando Banco Central.",
  hide: "Ocultar",
  seeTotal: "Ver total",
  totalIn: "Quiero ver mi total en",
  consultingCentralBank: "Consultando Banco Central...",
  officialTotalToPay: "Total oficial a pagar",
  reference: "Referencia",
  centralBankDate: "Fecha BCCh",
  foreignCurrencyNote:
    "Webpay Plus procesa el pago en pesos chilenos. La moneda extranjera es solo una referencia.",
  summary: "Resumen",
  subtotal: "Subtotal",
  total: "Total",
  processing: "Procesando...",
  payWithTransbank: "Pagar con Transbank",
  confirmOrder: "Confirmar pedido",
  orderRegistered: "Pedido registrado",
  pendingManualPayment: "Tu pedido quedo pendiente de validacion manual del pago.",
  keepShopping: "Seguir comprando",
  seeMyOrders: "Ver mis compras",
  remove: "Eliminar",
  dispatchAddress: "Direccion de despacho",
  addAddress: "Agregar",
  missingAddress: "Aun no has registrado una direccion.",
  storePickupOption: "Retiro en tienda",
  webpayName: "Webpay Plus (Transbank)",
  cardsHandledByWebpay:
    "Las tarjetas ya no se procesan dentro de esta app. El cobro se realiza en Webpay Plus para cumplir un flujo mas seguro y compatible con Transbank.",
  toTransfer: "Datos para transferencia",
  transferInstructions:
    "Realiza la transferencia a la cuenta indicada y luego confirma para registrar tu pedido.",
  bank: "Banco",
  accountType: "Tipo de cuenta",
  accountNumber: "N de cuenta",
  businessName: "Razon social",
  amountToTransfer: "Monto a transferir",
  transferRutNote: "Importante: indica tu RUT en el comentario de la transferencia para identificar tu pago.",
  cancel: "Cancelar",
  transferDone: "Ya transferi, confirmar pedido",
  copied: "copiado",
  copyFailed: "No se pudo copiar",
  chatWelcome: "Hola, soy tu asistente virtual. Preguntame por productos, pagos, retiro o despacho.",
  chatTitle: "Asistente FERREMAS",
  chatSubtitle: "Catalogo, stock y pagos",
  closeChat: "Cerrar chat",
  chatTyping: "Escribiendo respuesta...",
  chatPlaceholder: "Buscar taladro, despacho...",
  chatInputLabel: "Mensaje para el asistente",
  sendMessage: "Enviar mensaje",
  help: "Ayuda",
  stockLabel: "Stock",
} as const;

export type TranslationKey = keyof typeof sourceLabels;

type LabelMap = Record<TranslationKey, string>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const TRANSLATION_BATCH_SIZE = 20;
const translationCache: Partial<Record<Language, LabelMap>> = {};
const LanguageContext = createContext<LanguageContextValue | null>(null);

const getBaseLabels = (): LabelMap => ({ ...sourceLabels });

const translateLabelMap = async (target: Language) => {
  // Aqui se reemplaza la traduccion manual por LibreTranslate. Aca queremos un
  // solo origen en espanol y el backend traduce EN/PT en tandas para no repetir
  // bloques enormes de texto en el codigo.
  const nextLabels = getBaseLabels();
  const keys = Object.keys(sourceLabels) as TranslationKey[];

  for (let index = 0; index < keys.length; index += TRANSLATION_BATCH_SIZE) {
    const chunkKeys = keys.slice(index, index + TRANSLATION_BATCH_SIZE);
    const translations = await translateTexts(
      chunkKeys.map((key) => sourceLabels[key]),
      target
    );

    chunkKeys.forEach((key, chunkIndex) => {
      nextLabels[key] = translations[chunkIndex] || sourceLabels[key];
    });
  }

  return nextLabels;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("ferremas_language");
    return saved === "en" || saved === "pt" ? saved : "es";
  });
  const [labels, setLabels] = useState<LabelMap>(() => getBaseLabels());

  const setLanguage = (nextLanguage: Language) => {
    localStorage.setItem("ferremas_language", nextLanguage);
    setLanguageState(nextLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    if (language === "es") {
      setLabels(getBaseLabels());
      return () => {
        cancelled = true;
      };
    }

    if (translationCache[language]) {
      setLabels(translationCache[language]);
      return () => {
        cancelled = true;
      };
    }

    setLabels(getBaseLabels());

    translateLabelMap(language)
      .then((translatedLabels) => {
        translationCache[language] = translatedLabels;
        if (!cancelled) setLabels(translatedLabels);
      })
      .catch(() => {
        if (!cancelled) setLabels(getBaseLabels());
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => labels[key] || sourceLabels[key],
    }),
    [language, labels]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage debe usarse dentro de LanguageProvider.");
  }
  return context;
};
