import { useEffect, useMemo, useState } from "react";
import { translateTexts } from "@/lib/translate";
import { useLanguage } from "@/context/LanguageContext";

const memoryCache = new Map<string, string>();

export const useMachineTranslation = (texts: string[]) => {
  const { language } = useLanguage();
  const textKey = JSON.stringify(texts.map((text) => text || ""));
  const stableTexts = useMemo(() => JSON.parse(textKey) as string[], [textKey]);
  const [translatedTexts, setTranslatedTexts] = useState(stableTexts);

  useEffect(() => {
    let cancelled = false;

    if (language === "es") {
      setTranslatedTexts(stableTexts);
      return () => {
        cancelled = true;
      };
    }

    const cacheKeys = stableTexts.map((text) => `${language}:${text}`);
    const allCached = cacheKeys.every((key) => memoryCache.has(key));

    if (allCached) {
      setTranslatedTexts(cacheKeys.map((key) => memoryCache.get(key) || ""));
      return () => {
        cancelled = true;
      };
    }

    setTranslatedTexts(stableTexts);

    // Aca se consulta LibreTranslate solo para textos dinamicos. Si falla, el
    // hook mantiene el texto original para que el usuario nunca vea la pagina rota.
    translateTexts(stableTexts, language)
      .then((translations) => {
        if (cancelled) return;
        translations.forEach((translation, index) => {
          memoryCache.set(cacheKeys[index], translation);
        });
        setTranslatedTexts(translations);
      })
      .catch(() => {
        if (!cancelled) setTranslatedTexts(stableTexts);
      });

    return () => {
      cancelled = true;
    };
  }, [language, stableTexts]);

  return translatedTexts;
};
