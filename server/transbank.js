import TransbankSdk from "transbank-sdk";

// Este modulo centraliza toda la configuracion de Transbank/Webpay Plus.
// Asi el resto del backend solo pide "una transaccion Webpay" y no necesita
// saber si estamos usando credenciales de integracion o credenciales reales.
const {
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus,
} = TransbankSdk;

const getEnvironment = () =>
  // En desarrollo/demo usamos el ambiente Integration de Transbank, que permite
  // probar con las tarjetas oficiales de la documentacion. En Render/Vercel se
  // cambia a Production definiendo TRANSBANK_ENV=production.
  process.env.TRANSBANK_ENV?.toLowerCase() === "production"
    ? Environment.Production
    : Environment.Integration;

const getOptions = () => {
  const environment = getEnvironment();

  if (environment === Environment.Production) {
    // En produccion estas credenciales pertenecen al comercio real y deben vivir
    // solo como variables de entorno del backend. Nunca deben enviarse al frontend
    // ni quedar escritas en el repositorio.
    const commerceCode = process.env.TRANSBANK_COMMERCE_CODE;
    const apiKey = process.env.TRANSBANK_API_KEY;

    if (!commerceCode || !apiKey) {
      throw new Error(
        "Faltan TRANSBANK_COMMERCE_CODE o TRANSBANK_API_KEY para usar Transbank en produccion."
      );
    }

    return new Options(commerceCode, apiKey, environment);
  }

  // Credenciales oficiales de integracion: sirven para pruebas academicas/locales.
  // No procesan dinero real y son las que Transbank documenta para Webpay Plus.
  return new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    environment
  );
};

export const getWebpayTransaction = () => new WebpayPlus.Transaction(getOptions());
export const isProductionTransbank = () => getEnvironment() === Environment.Production;
