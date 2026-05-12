import TransbankSdk from "transbank-sdk";

const {
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus,
} = TransbankSdk;

const getEnvironment = () =>
  process.env.TRANSBANK_ENV?.toLowerCase() === "production"
    ? Environment.Production
    : Environment.Integration;

const getOptions = () => {
  const environment = getEnvironment();

  if (environment === Environment.Production) {
    const commerceCode = process.env.TRANSBANK_COMMERCE_CODE;
    const apiKey = process.env.TRANSBANK_API_KEY;

    if (!commerceCode || !apiKey) {
      throw new Error(
        "Faltan TRANSBANK_COMMERCE_CODE o TRANSBANK_API_KEY para usar Transbank en produccion."
      );
    }

    return new Options(commerceCode, apiKey, environment);
  }

  return new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    environment
  );
};

export const getWebpayTransaction = () => new WebpayPlus.Transaction(getOptions());
export const isProductionTransbank = () => getEnvironment() === Environment.Production;
