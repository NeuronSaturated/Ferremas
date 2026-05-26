import { apiFetch } from "@/lib/api";

type TranslateLanguage = "es" | "en" | "pt";

type TranslateResponse = {
  source: TranslateLanguage;
  target: TranslateLanguage;
  translations: string[];
};

export const translateTexts = async (
  texts: string[],
  target: TranslateLanguage,
  source: TranslateLanguage = "es"
) => {
  // Aqui el frontend pide traducciones al backend propio, no directo a LibreTranslate.
  // En esta parte se evita publicar API keys y se permite que el backend use cache/fallback.
  if (target === source || texts.length === 0) return texts;

  const response = await apiFetch<TranslateResponse>("/api/translate", {
    method: "POST",
    body: JSON.stringify({ texts, target, source }),
  });

  return response.translations;
};
