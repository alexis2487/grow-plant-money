import type { LanguageOption, SupportedLanguage, TranslationSchema } from "../types";
import { es } from "./es";
import { en } from "./en";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "es",
    label: "Español",
    nativeLabel: "Español",
    flag: "🇪🇸",
    locale: "es-CO",
  },
  {
    code: "en",
    label: "Inglés",
    nativeLabel: "English",
    flag: "🇺🇸",
    locale: "en-US",
  },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = "es";

export const TRANSLATIONS: Record<SupportedLanguage, TranslationSchema> = {
  es,
  en,
};

export { es, en };
