import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type Language = "es" | "en" | "pt";

const labels = {
  // Aqui se guardan traducciones manuales para la interfaz principal.
  // Aca no se usa Google Translate porque una API externa agregaria credenciales,
  // costo y dependencia; para la demo basta con textos controlados.
  es: {
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
  },
  en: {
    home: "Home",
    catalog: "Catalog",
    branches: "Stores",
    search: "Search products, brands, SKU...",
    searchShort: "Search...",
    signIn: "Sign in",
    cart: "Cart",
    profile: "My profile",
    orders: "My orders",
    signOut: "Sign out",
    productNotFound: "Product not found",
    backToCatalog: "Back to catalog",
    back: "Back",
    sku: "SKU",
    vatIncluded: "VAT included",
    referenceRate: "Central Bank reference",
    language: "Language",
    available: "units available",
    outOfStock: "Out of stock",
    description: "Description",
    addToCart: "Add to cart",
    keepBrowsing: "Keep browsing",
    shippingTitle: "Shipping across Chile",
    shippingText: "2 to 5 business days",
    warrantyTitle: "Official warranty",
    warrantyText: "12 months factory warranty",
    pickupTitle: "Store pickup",
    pickupText: "Free in 6 stores",
    finalPaymentClp: "Final payment is processed in CLP.",
  },
  pt: {
    home: "Inicio",
    catalog: "Catalogo",
    branches: "Lojas",
    search: "Buscar produtos, marcas, SKU...",
    searchShort: "Buscar...",
    signIn: "Entrar",
    cart: "Carrinho",
    profile: "Meu perfil",
    orders: "Minhas compras",
    signOut: "Sair",
    productNotFound: "Produto nao encontrado",
    backToCatalog: "Voltar ao catalogo",
    back: "Voltar",
    sku: "SKU",
    vatIncluded: "IVA incluido",
    referenceRate: "Referencia Banco Central",
    language: "Idioma",
    available: "unidades disponiveis",
    outOfStock: "Sem estoque",
    description: "Descricao",
    addToCart: "Adicionar ao carrinho",
    keepBrowsing: "Continuar explorando",
    shippingTitle: "Entrega em todo o Chile",
    shippingText: "2 a 5 dias uteis",
    warrantyTitle: "Garantia oficial",
    warrantyText: "12 meses de fabrica",
    pickupTitle: "Retirada na loja",
    pickupText: "Gratis em 6 lojas",
    finalPaymentClp: "O pagamento final e processado em CLP.",
  },
};

type TranslationKey = keyof typeof labels.es;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // En esta parte se restaura el idioma elegido por el usuario.
    const saved = localStorage.getItem("ferremas_language");
    return saved === "en" || saved === "pt" ? saved : "es";
  });

  const setLanguage = (nextLanguage: Language) => {
    // Aqui se persiste el idioma para que sobreviva a recargas.
    localStorage.setItem("ferremas_language", nextLanguage);
    setLanguageState(nextLanguage);
  };

  useEffect(() => {
    // Aca se actualiza el atributo lang del documento para accesibilidad.
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => labels[language][key],
    }),
    [language]
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
