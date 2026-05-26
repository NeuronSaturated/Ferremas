const DEFAULT_TRANSLATE_URL = "https://libretranslate.com";
const TARGET_LANGUAGE_MAP = {
  es: "es",
  en: "en",
  pt: "pt",
};

const cache = new Map();

const getTranslateConfig = () => ({
  baseUrl: (process.env.LIBRETRANSLATE_URL || DEFAULT_TRANSLATE_URL).replace(/\/$/, ""),
  apiKey: process.env.LIBRETRANSLATE_API_KEY || "",
});

const normalizeTexts = (texts) =>
  (Array.isArray(texts) ? texts : [texts])
    .map((text) => String(text || "").trim())
    .filter(Boolean)
    .slice(0, 20);

export const getSupportedTranslateLanguages = () => Object.keys(TARGET_LANGUAGE_MAP);

const translateWithLibreTranslate = async ({ text, sourceLanguage, targetLanguage }) => {
  const { baseUrl, apiKey } = getTranslateConfig();
  const body = {
    q: text,
    source: sourceLanguage,
    target: targetLanguage,
    format: "text",
  };

  if (apiKey) {
    body.api_key = apiKey;
  }

  const response = await fetch(`${baseUrl}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate respondio ${response.status}`);
  }

  const data = await response.json();
  return String(data?.translatedText || text);
};

const translateWithMyMemory = async ({ text, sourceLanguage, targetLanguage }) => {
  // Aqui se usa MyMemory como respaldo sin API key. No reemplaza a
  // LibreTranslate en produccion, pero ayuda mucho para una demo academica.
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${sourceLanguage}|${targetLanguage}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`MyMemory respondio ${response.status}`);
  }

  const data = await response.json();
  return String(data?.responseData?.translatedText || text);
};

export const translateTexts = async ({ texts, target, source = "es" }) => {
  // Aqui se integra LibreTranslate desde el backend para no exponer llaves en React.
  // En esta parte se traduce contenido dinamico de la pagina, como productos o chat.
  // Si la API publica falla o pide llave, se responde el texto original para que la
  // tienda siga funcionando igual y la traduccion no bloquee la compra.
  const normalizedTexts = normalizeTexts(texts);
  const sourceLanguage = TARGET_LANGUAGE_MAP[source] || "es";
  const targetLanguage = TARGET_LANGUAGE_MAP[target] || "es";

  if (normalizedTexts.length === 0) {
    return [];
  }

  if (sourceLanguage === targetLanguage) {
    return normalizedTexts;
  }

  const translatedTexts = [];

  for (const text of normalizedTexts) {
    const cacheKey = `${sourceLanguage}:${targetLanguage}:${text}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      translatedTexts.push(cached);
      continue;
    }

    try {
      let translatedText;

      try {
        translatedText = await translateWithLibreTranslate({
          text,
          sourceLanguage,
          targetLanguage,
        });
      } catch (libreError) {
        console.warn("LibreTranslate fallo; se intenta MyMemory:", libreError.message);
        translatedText = await translateWithMyMemory({
          text,
          sourceLanguage,
          targetLanguage,
        });
      }

      cache.set(cacheKey, translatedText);
      translatedTexts.push(translatedText);
    } catch (error) {
      console.warn("No se pudo traducir; se usa texto original:", error.message);
      translatedTexts.push(text);
    }
  }

  return translatedTexts;
};
