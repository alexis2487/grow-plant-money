import { describe, it, expect } from "vitest";
import { buildReportHtml, currentPeriodLabel, type ReportData } from "../lib/report";

describe("report.ts - Suite de Pruebas de Reportes", () => {
  it("currentPeriodLabel devuelve string no vacío", () => {
    const label = currentPeriodLabel();
    expect(label).toBeTruthy();
    expect(typeof label).toBe("string");
  });

  it("buildReportHtml genera HTML válido para reporte débito", () => {
    const data: ReportData = {
      userName: "Alexis",
      period: "Septiembre 2026",
      currency: "COP",
      reportType: "debit",
      income: 5000000,
      expense: 2000000,
      balance: 3000000,
      savingsRate: 0.6,
      healthScore: 88,
      healthLabel: "Saludable",
      transactionCount: 15,
      categories: [{ emoji: "🍔", name: "Alimentación", amount: 1000000, share: 50 }],
      months: [{ label: "sep", income: 5000000, expense: 2000000 }],
      insights: ["¡Gran tasa de ahorro este mes!"],
      completedChallenges: 3,
      growthPoints: 350,
    };

    const html = buildReportHtml(data);
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("PlantWallet Débito");
    expect(html).toContain("Alexis");
    expect(html).toContain("Septiembre 2026");
    expect(html).toContain("50%");
    expect(html).toContain("Alimentación");
    expect(html).toContain("350 Growth Points");
  });

  it("buildReportHtml genera HTML adecuado para tarjeta de crédito", () => {
    const data: ReportData = {
      userName: "Alexis",
      period: "Septiembre 2026",
      currency: "COP",
      reportType: "credit",
      income: 300000, // Abonos
      expense: 1500000, // Compras crédito
      balance: 1200000,
      transactionCount: 5,
      categories: [{ emoji: "🛍️", name: "Compras", amount: 1500000, share: 100 }],
      months: [{ label: "sep", income: 300000, expense: 1500000 }],
      insights: ["Tus consumos a crédito se mantienen separados"],
      completedChallenges: 0,
      growthPoints: 0,
    };

    const html = buildReportHtml(data);
    expect(html).toContain("PlantWallet Crédito");
    expect(html).toContain("Compras a Crédito");
    expect(html).toContain("Saldo Pendiente Neto");
  });
});
