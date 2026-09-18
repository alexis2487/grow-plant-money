import { describe, it, expect } from "vitest";
import { SUPPORTED_LANGUAGES, TRANSLATIONS, DEFAULT_LANGUAGE } from "../i18n";
import { es } from "../i18n/locales/es";
import { en } from "../i18n/locales/en";

describe("i18n - Sistema de Internacionalización", () => {
  it("contiene los idiomas soportados (Español e Inglés)", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("es");
    expect(codes).toContain("en");
    expect(DEFAULT_LANGUAGE).toBe("es");
  });

  it("el diccionario en español está completo y bien estructurado", () => {
    expect(es.common.appName).toBe("PlantWallet");
    expect(es.nav.home).toBe("Inicio");
    expect(es.nav.settings).toBe("Ajustes");
    expect(es.settings.language).toBe("Idioma");
    expect(es.settings.title).toBe("Ajustes");
  });

  it("el diccionario en inglés tiene equivalencias para las claves principales", () => {
    expect(en.common.appName).toBe("PlantWallet");
    expect(en.nav.home).toBe("Home");
    expect(en.nav.settings).toBe("Settings");
    expect(en.settings.language).toBe("Language");
    expect(en.settings.title).toBe("Settings");
  });

  it("las estructuras de claves entre español e inglés son consistentes", () => {
    const esKeys = Object.keys(es) as (keyof typeof es)[];
    const enKeys = Object.keys(en) as (keyof typeof en)[];
    expect(esKeys.sort()).toEqual(enKeys.sort());

    for (const section of esKeys) {
      const esSubKeys = Object.keys(es[section]).sort();
      const enSubKeys = Object.keys(en[section]).sort();
      expect(enSubKeys).toEqual(esSubKeys);
    }
  });

  it("soporta interpolación de variables en cadenas de texto", () => {
    const template = es.settings.categoriesCount; // "Categorías ({count})"
    const result = template.replace("{count}", "15");
    expect(result).toBe("Categorías (15)");

    const enTemplate = en.settings.categoriesCount; // "Categories ({count})"
    const enResult = enTemplate.replace("{count}", "15");
    expect(enResult).toBe("Categories (15)");
  });

  it("los locales formatean números y monedas coherentemente", () => {
    const esLocale = SUPPORTED_LANGUAGES.find((l) => l.code === "es")?.locale;
    const enLocale = SUPPORTED_LANGUAGES.find((l) => l.code === "en")?.locale;

    expect(esLocale).toBe("es-CO");
    expect(enLocale).toBe("en-US");

    const amount = 50000;
    const esFormatted = new Intl.NumberFormat(esLocale, {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
    const enFormatted = new Intl.NumberFormat(enLocale, {
      style: "currency",
      currency: "USD",
    }).format(amount);

    expect(esFormatted).toBeTruthy();
    expect(enFormatted).toContain("50,000");
  });
});
