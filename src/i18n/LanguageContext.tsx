import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { SupportedLanguage, LanguageOption, TranslationSchema } from "./types";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, TRANSLATIONS } from "./locales";

const STORAGE_KEY = "plantwallet_language";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  currentLanguage: LanguageOption;
  supportedLanguages: LanguageOption[];
  locale: string;
  formatMoney: (value: number, currency?: string, compact?: boolean) => string;
  formatDate: (date: string | Date, style?: "short" | "long") => string;
  monthLabel: (offset?: number) => string;
  greeting: (name?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && (saved === "es" || saved === "en")) {
      return saved;
    }
    // Detección automática del navegador del dispositivo
    const browserLang = navigator.language?.slice(0, 2).toLowerCase();
    if (browserLang === "en") return "en";
    if (browserLang === "es") return "es";
  } catch {
    // Modo seguro
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({
  children,
  initialLanguage,
  onLanguageChange,
}: {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    () => initialLanguage ?? getInitialLanguage(),
  );

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage, language]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
      } catch {
        // Silencioso
      }
    }
  }, [language]);

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      setLanguageState(lang);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, lang);
          document.documentElement.lang = lang;
        } catch {
          // Silencioso
        }
      }
      onLanguageChange?.(lang);
    },
    [onLanguageChange],
  );

  const currentOption = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? SUPPORTED_LANGUAGES[0],
    [language],
  );

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split(".");
      let currentObj: unknown = TRANSLATIONS[language];

      for (const k of keys) {
        if (currentObj && typeof currentObj === "object" && k in currentObj) {
          currentObj = (currentObj as Record<string, unknown>)[k];
        } else {
          // Fallback a español si no se encuentra en el idioma seleccionado
          let fallbackObj: unknown = TRANSLATIONS[DEFAULT_LANGUAGE];
          for (const fbKey of keys) {
            if (fallbackObj && typeof fallbackObj === "object" && fbKey in fallbackObj) {
              fallbackObj = (fallbackObj as Record<string, unknown>)[fbKey];
            } else {
              fallbackObj = undefined;
              break;
            }
          }
          currentObj = fallbackObj;
          break;
        }
      }

      if (typeof currentObj !== "string") {
        return path;
      }

      let result = currentObj;
      if (params) {
        for (const [pKey, pVal] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
        }
      }
      return result;
    },
    [language],
  );

  const locale = currentOption.locale;

  const formatMoneyFn = useCallback(
    (value: number, currency = "COP", compact = false) => {
      const zeroDecimals = currency === "COP";
      const decimals = zeroDecimals ? 0 : 2;
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: compact ? 0 : decimals,
        maximumFractionDigits: compact ? 0 : decimals,
        notation: compact ? "compact" : "standard",
      }).format(value);
    },
    [locale],
  );

  const formatDateFn = useCallback(
    (date: string | Date, style: "short" | "long" = "short") => {
      let d: Date;
      if (typeof date === "string") {
        const s = date.includes("T") ? date : `${date}T00:00:00`;
        d = new Date(s);
      } else {
        d = date;
      }
      if (Number.isNaN(d.getTime())) {
        d = new Date();
      }
      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: style === "long" ? "long" : "2-digit",
        year: "numeric",
      }).format(d);
    },
    [locale],
  );

  const monthLabelFn = useCallback(
    (offset = 0) => {
      const now = new Date();
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(d);
    },
    [locale],
  );

  const greetingFn = useCallback(
    (name?: string | null) => {
      const h = new Date().getHours();
      let base = "";
      if (language === "en") {
        base = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
      } else {
        base = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
      }
      return name ? `${base}, ${name.split(" ")[0]}` : base;
    },
    [language],
  );

  const value: LanguageContextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      currentLanguage: currentOption,
      supportedLanguages: SUPPORTED_LANGUAGES,
      locale,
      formatMoney: formatMoneyFn,
      formatDate: formatDateFn,
      monthLabel: monthLabelFn,
      greeting: greetingFn,
    }),
    [
      language,
      setLanguage,
      t,
      currentOption,
      locale,
      formatMoneyFn,
      formatDateFn,
      monthLabelFn,
      greetingFn,
    ],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Retornar fallback seguro para contextos fuera del Provider
    const fallbackLang = DEFAULT_LANGUAGE;
    const currentOption = SUPPORTED_LANGUAGES[0];
    const fallbackT = (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split(".");
      let currentObj: unknown = TRANSLATIONS[fallbackLang];
      for (const k of keys) {
        if (currentObj && typeof currentObj === "object" && k in currentObj) {
          currentObj = (currentObj as Record<string, unknown>)[k];
        } else {
          return path;
        }
      }
      let result = typeof currentObj === "string" ? currentObj : path;
      if (params) {
        for (const [pKey, pVal] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
        }
      }
      return result;
    };

    return {
      language: fallbackLang,
      setLanguage: () => {},
      t: fallbackT,
      currentLanguage: currentOption,
      supportedLanguages: SUPPORTED_LANGUAGES,
      locale: currentOption.locale,
      formatMoney: (val: number, curr = "COP", compact = false) =>
        new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: curr,
          minimumFractionDigits: compact ? 0 : curr === "COP" ? 0 : 2,
          maximumFractionDigits: compact ? 0 : curr === "COP" ? 0 : 2,
          notation: compact ? "compact" : "standard",
        }).format(val),
      formatDate: (d: string | Date) => String(d),
      monthLabel: () => "",
      greeting: (name?: string | null) => (name ? `Hola, ${name}` : "Hola"),
    };
  }
  return context;
}
