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

  const { baseUrl, apiKey } = getTranslateConfig();
  const translatedTexts = [];

  for (const text of normalizedTexts) {
    const cacheKey = `${sourceLanguage}:${targetLanguage}:${text}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      translatedTexts.push(cached);
      continue;
    }

    try {
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
      const translatedText = String(data?.translatedText || text);
      cache.set(cacheKey, translatedText);
      translatedTexts.push(translatedText);
    } catch (error) {
      console.warn("LibreTranslate no pudo traducir; se usa texto original:", error.message);
      translatedTexts.push(text);
    }
  }

  return translatedTexts;
};
