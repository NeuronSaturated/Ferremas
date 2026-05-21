const BCCH_API_URL = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx";

// Codigos de series oficiales de la API BDE del Banco Central.
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
};

const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

const formatDate = (date) => date.toISOString().slice(0, 10);

const parseBcchNumber = (value) => {
  const normalized = String(value || "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const getDateRange = () => {
  // Se consulta una ventana de 14 dias porque las series no siempre publican datos
  // durante fines de semana o feriados. Luego se toma la observacion valida mas reciente.
  const last = new Date();
  const first = new Date(last);
  first.setDate(first.getDate() - 14);

  return {
    firstdate: formatDate(first),
    lastdate: formatDate(last),
  };
};

const readLatestValidObservation = (payload) => {
  // La respuesta de Banco Central llega como un arreglo cronologico de observaciones.
  // Recorremos desde el final para usar el dato oficial disponible mas reciente.
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
    // La API BDE requiere credenciales. Se fuerzan por variables de entorno para
    // no exponer usuario/clave en frontend, repositorio ni README.
    const error = new Error("Faltan BCCH_USER y BCCH_PASS para consultar la API del Banco Central.");
    error.status = 503;
    throw error;
  }

  const cached = cache.get(normalizedCurrency);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    // Cache corto para no llamar al Banco Central en cada render del carrito.
    return cached;
  }

  const { firstdate, lastdate } = getDateRange();
  const url = new URL(BCCH_API_URL);
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
