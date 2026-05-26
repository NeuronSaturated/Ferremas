import TransbankSdk from "transbank-sdk";

// Aqui se centraliza toda la configuracion de Transbank/Webpay Plus.
// En esta parte el backend decide si trabajara con el ambiente de integracion
// o con produccion, sin mezclar esa logica con las rutas de pago.
const {
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus,
} = TransbankSdk;

const getEnvironment = () =>
  // Aqui se usa Integration por defecto para pruebas con tarjetas oficiales.
  // Ahora, si TRANSBANK_ENV queda como production, el SDK apunta al ambiente real.
  process.env.TRANSBANK_ENV?.toLowerCase() === "production"
    ? Environment.Production
    : Environment.Integration;

const getOptions = () => {
  const environment = getEnvironment();

  if (environment === Environment.Production) {
    // En esta parte se leen las credenciales reales del comercio. Aca se busca
    // que el codigo nunca exponga la API key al navegador ni al repositorio.
    const commerceCode = process.env.TRANSBANK_COMMERCE_CODE;
    const apiKey = process.env.TRANSBANK_API_KEY;

    if (!commerceCode || !apiKey) {
      throw new Error(
        "Faltan TRANSBANK_COMMERCE_CODE o TRANSBANK_API_KEY para usar Transbank en produccion."
      );
    }

    return new Options(commerceCode, apiKey, environment);
  }

  // Aqui quedan las credenciales oficiales de integracion. Sirven para demo,
  // pruebas academicas y flujo Webpay sin mover dinero real.
  return new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    environment
  );
};

export const getWebpayTransaction = () => new WebpayPlus.Transaction(getOptions());
export const isProductionTransbank = () => getEnvironment() === Environment.Production;
