const BCCH_API_URL = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx";

// Aqui vive la integracion con la API BDE del Banco Central de Chile.
// En esta parte se busca convertir monedas extranjeras a pesos chilenos usando
// datos oficiales, pero sin exponer BCCH_USER ni BCCH_PASS en el frontend.

// Aca se declaran los codigos de series oficiales de la API BDE.
// Cada valor de estas series representa pesos chilenos por 1 unidad de moneda extranjera.
const SUPPORTED_SERIES = {
  USD: {
    series: "F073.TCO.PRE.Z.D",
    label: "Dolar observado",
  },
  EUR: {
    series: "F072.CLP.EUR.N.O.D",
    label: "Euro observado",
  },
  BRL: {
    series: "F072.CLP.BRL.N.O.D",
    label: "Real brasileno observado",
  },
  GBP: {
    series: "F072.CLP.GBP.N.O.D",
    label: "Libra esterlina observada",
  },
};

const cache = new Map();
// Aqui se cachea la tasa por 1 hora. La tasa oficial no cambia cada segundo,
// entonces esta parte evita llamar al Banco Central en cada render.
const CACHE_TTL_MS = 60 * 60 * 1000;

const formatDate = (date) => date.toISOString().slice(0, 10);

const parseBcchNumber = (value) => {
  const normalized = String(value || "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const getDateRange = () => {
  // Aqui se consulta una ventana de 14 dias porque las series no siempre publican
  // datos durante fines de semana o feriados. Luego se toma el dato mas reciente.
  const last = new Date();
  const first = new Date(last);
  first.setDate(first.getDate() - 14);

  return {
    firstdate: formatDate(first),
    lastdate: formatDate(last),
  };
};

const readLatestValidObservation = (payload) => {
  // En esta parte la respuesta del Banco Central se revisa desde el final,
  // porque ahi suele venir la observacion oficial disponible mas reciente.
  const observations = Array.isArray(payload?.Series?.Obs) ? payload.Series.Obs : [];
  const latest = [...observations]
    .reverse()
    .find((item) => item?.statusCode === "OK" && parseBcchNumber(item?.value) !== null);

  if (!latest) {
    return null;
  }

  return {
    date: latest.indexDateString,
    value: parseBcchNumber(latest.value),
  };
};

export const getSupportedExchangeCurrencies = () => Object.keys(SUPPORTED_SERIES);

export const getExchangeRate = async (currency) => {
  const normalizedCurrency = String(currency || "").trim().toUpperCase();
  const config = SUPPORTED_SERIES[normalizedCurrency];

  if (!config) {
    const supported = getSupportedExchangeCurrencies().join(", ");
    const error = new Error(`Moneda no soportada. Usa una de estas: ${supported}.`);
    error.status = 400;
    throw error;
  }

  const user = process.env.BCCH_USER;
  const pass = process.env.BCCH_PASS;

  if (!user || !pass) {
    // Aca se exige que la API BDE tenga credenciales por variables de entorno.
    // Asi el usuario y clave no quedan en frontend, repositorio ni README.
    const error = new Error("Faltan BCCH_USER y BCCH_PASS para consultar la API del Banco Central.");
    error.status = 503;
    throw error;
  }

  const cached = cache.get(normalizedCurrency);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    // Aqui se retorna el cache cuando aun esta vigente.
    return cached;
  }

  const { firstdate, lastdate } = getDateRange();
  const url = new URL(BCCH_API_URL);
  // En esta parte se arma la consulta GetSeries con parametros query. Aca se
  // pide solo una ventana reciente para traer la ultima observacion disponible.
  url.searchParams.set("user", user);
  url.searchParams.set("pass", pass);
  url.searchParams.set("function", "GetSeries");
  url.searchParams.set("timeseries", config.series);
  url.searchParams.set("firstdate", firstdate);
  url.searchParams.set("lastdate", lastdate);

  const response = await fetch(url);
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload || payload.Codigo !== 0) {
    const error = new Error(payload?.Descripcion || "No se pudo consultar la API del Banco Central.");
    error.status = 502;
    throw error;
  }

  const latest = readLatestValidObservation(payload);
  if (!latest) {
    const error = new Error("La API del Banco Central no entrego observaciones validas para la moneda.");
    error.status = 502;
    throw error;
  }

  const result = {
    currency: normalizedCurrency,
    label: config.label,
    rate: latest.value,
    date: latest.date,
    source: "Banco Central de Chile - API BDE",
    series: config.series,
    cachedAt: Date.now(),
  };

  cache.set(normalizedCurrency, result);
  return result;
};
