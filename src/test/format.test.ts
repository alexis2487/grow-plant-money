import { describe, it, expect } from "vitest";
import {
  formatMoney,
  parseAmount,
  formatDate,
  isoDate,
  monthRange,
  monthLabel,
  greeting,
  paymentLabel,
  CURRENCIES,
  PAYMENT_METHODS,
} from "../lib/format";

describe("format.ts - Suite de Pruebas", () => {
  describe("parseAmount", () => {
    it("parsea enteros simples", () => {
      expect(parseAmount("50000")).toBe(50000);
      expect(parseAmount("100")).toBe(100);
      expect(parseAmount("0")).toBe(0);
    });

    it("parsea cantidades con separadores de miles con puntos (formato Colombia/Latam)", () => {
      expect(parseAmount("50.000")).toBe(50000);
      expect(parseAmount("1.000.000")).toBe(1000000);
      expect(parseAmount("25.500.000")).toBe(25500000);
    });

    it("parsea cantidades con comas como separadores de miles", () => {
      expect(parseAmount("50,000")).toBe(50000);
      expect(parseAmount("1,000,000")).toBe(1000000);
      expect(parseAmount("2,500,000")).toBe(2500000);
    });

    it("parsea decimales con coma o punto", () => {
      expect(parseAmount("12.5")).toBe(12.5);
      expect(parseAmount("12,5")).toBe(12.5);
      expect(parseAmount("99.99")).toBe(99.99);
      expect(parseAmount("99,99")).toBe(99.99);
    });

    it("parsea números con formato mixto internacional (US vs Europeo)", () => {
      expect(parseAmount("1,234.56")).toBe(1234.56);
      expect(parseAmount("1.234,56")).toBe(1234.56);
      expect(parseAmount("10,500.50")).toBe(10500.5);
    });

    it("limpia caracteres extraños y símbolos de moneda", () => {
      expect(parseAmount("$ 50.000 COP")).toBe(50000);
      expect(parseAmount("€ 1.234,56")).toBe(1234.56);
      expect(parseAmount(" -500 ")).toBe(-500);
    });

    it("maneja entradas vacías o inválidas devolviendo 0", () => {
      expect(parseAmount("")).toBe(0);
      expect(parseAmount("abc")).toBe(0);
      expect(parseAmount("-")).toBe(0);
      expect(parseAmount(null as unknown as string)).toBe(0);
      expect(parseAmount(undefined as unknown as string)).toBe(0);
    });
  });

  describe("formatMoney", () => {
    it("formatea en COP sin decimales por defecto", () => {
      const result = formatMoney(50000, "COP");
      expect(result).toContain("50.000");
    });

    it("formatea en USD con 2 decimales", () => {
      const result = formatMoney(1234.56, "USD");
      expect(result).toContain("1.234,56");
    });

    it("soporta modo compacto", () => {
      const result = formatMoney(1000000, "COP", true);
      expect(result).toBeTruthy();
    });

    it("soporta monedas registradas en CURRENCIES", () => {
      for (const cur of CURRENCIES) {
        expect(() => formatMoney(100, cur.code)).not.toThrow();
      }
    });
  });

  describe("formatDate", () => {
    it("formatea fecha YYYY-MM-DD en estilo short", () => {
      const formatted = formatDate("2026-09-18", "short");
      expect(formatted).toMatch(/18\/09\/2026/);
    });

    it("formatea fecha con timestamp ISO completo sin romper por invalid date", () => {
      const formatted = formatDate("2026-09-18T15:30:00.000Z", "short");
      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe("Invalid Date");
    });

    it("formatea objetos Date", () => {
      const d = new Date(2026, 8, 18);
      const formatted = formatDate(d, "short");
      expect(formatted).toMatch(/18\/09\/2026/);
    });

    it("recupera ante fechas inválidas sin lanzar excepción", () => {
      expect(() => formatDate("fecha-invalida")).not.toThrow();
    });
  });

  describe("isoDate", () => {
    it("genera formato YYYY-MM-DD con ceros a la izquierda", () => {
      const d = new Date(2026, 0, 5); // 5 de enero de 2026
      expect(isoDate(d)).toBe("2026-01-05");
    });
  });

  describe("monthRange", () => {
    it("calcula inicio y fin del mes actual (offset 0)", () => {
      const range = monthRange(0);
      expect(range.start).toMatch(/^\d{4}-\d{2}-01$/);
      expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.start <= range.end).toBe(true);
    });

    it("calcula meses pasados y futuros con offset", () => {
      const prev = monthRange(-1);
      const next = monthRange(1);
      expect(prev.start < next.start).toBe(true);
    });
  });

  describe("monthLabel", () => {
    it("devuelve el nombre del mes y año en español", () => {
      const label = monthLabel(0);
      expect(label).toBeTruthy();
      expect(typeof label).toBe("string");
    });
  });

  describe("greeting", () => {
    it("devuelve saludo según la hora y añade el primer nombre si existe", () => {
      const g1 = greeting("Alexis Romero");
      expect(g1).toContain("Alexis");
      const g2 = greeting(null);
      expect(["Buenos días", "Buenas tardes", "Buenas noches"]).toContain(g2);
    });
  });

  describe("paymentLabel", () => {
    it("mapea los métodos de pago a etiquetas en español", () => {
      expect(paymentLabel("cash")).toBe("Efectivo");
      expect(paymentLabel("debit")).toBe("Tarjeta débito");
      expect(paymentLabel("credit")).toBe("Tarjeta crédito");
      expect(paymentLabel("transfer")).toBe("Transferencia");
      expect(paymentLabel("other")).toBe("Otro");
      expect(paymentLabel("desconocido")).toBe("—");
      expect(paymentLabel(null)).toBe("—");
    });
  });
});
