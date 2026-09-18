import { describe, it, expect } from "vitest";
import {
  isCreditTx,
  totalsFor,
  sum,
  computeHealth,
  healthState,
  healthLabel,
  categoryBreakdown,
  monthlySeries,
  dailySeries,
  buildInsights,
  clamp,
} from "../lib/finance";
import type { Budget, Category, Transaction } from "../lib/types";
import { monthRange } from "../lib/format";

const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat_food",
    user_id: "u1",
    name: "Alimentación",
    emoji: "🍔",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    id: "cat_sal",
    user_id: "u1",
    name: "Salario",
    emoji: "💼",
    type: "income",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    id: "cat_fun",
    user_id: "u1",
    name: "Ocio",
    emoji: "🎮",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
];

describe("finance.ts - Suite de Pruebas de Salud y Finanzas", () => {
  describe("isCreditTx", () => {
    it("detecta tarjetas de crédito", () => {
      expect(isCreditTx({ payment_method: "credit" })).toBe(true);
      expect(isCreditTx({ payment_method: "cash" })).toBe(false);
      expect(isCreditTx({ payment_method: "debit" })).toBe(false);
      expect(isCreditTx({ payment_method: null })).toBe(false);
      expect(isCreditTx({})).toBe(false);
    });
  });

  describe("sum", () => {
    it("suma correctamente los importes numéricos y cadenas", () => {
      const txs = [
        { amount: 1000 } as Transaction,
        { amount: 2500 } as Transaction,
        { amount: "500" as unknown as number } as Transaction,
      ];
      expect(sum(txs)).toBe(4000);
      expect(sum([])).toBe(0);
    });
  });

  describe("totalsFor", () => {
    const range = monthRange(0);
    const txs: Transaction[] = [
      {
        id: "1",
        user_id: "u1",
        type: "income",
        amount: 3000000,
        currency: "COP",
        category_id: "cat_sal",
        transaction_date: range.start,
        payment_method: "transfer",
        is_recurring: false,
        recurring_rule: null,
        description: "Salario",
        notes: null,
        created_at: "",
      },
      {
        id: "2",
        user_id: "u1",
        type: "expense",
        amount: 1000000,
        currency: "COP",
        category_id: "cat_food",
        transaction_date: range.start,
        payment_method: "cash",
        is_recurring: false,
        recurring_rule: null,
        description: "Mercado",
        notes: null,
        created_at: "",
      },
      {
        id: "3",
        user_id: "u1",
        type: "expense",
        amount: 500000,
        currency: "COP",
        category_id: "cat_fun",
        transaction_date: range.start,
        payment_method: "credit", // Tarjeta de crédito
        is_recurring: false,
        recurring_rule: null,
        description: "Juegos",
        notes: null,
        created_at: "",
      },
    ];

    it("separa los totales de débito/efectivo de los de crédito", () => {
      const totals = totalsFor(txs, range.start, range.end);
      expect(totals.income).toBe(3000000); // Sólo ingresos líquidos
      expect(totals.expense).toBe(1000000); // Gasto débito
      expect(totals.balance).toBe(2000000); // 3M - 1M
      expect(totals.totalExpense).toBe(1500000); // 1M débito + 500k crédito
      expect(totals.debit.savingsRate).toBeCloseTo(2000000 / 3000000);
      expect(totals.credit.expense).toBe(500000);
      expect(totals.credit.balance).toBe(500000);
    });

    it("filtra únicamente transacciones en el rango de fechas", () => {
      const outOfRange = totalsFor(txs, "1999-01-01", "1999-01-31");
      expect(outOfRange.count).toBe(0);
      expect(outOfRange.income).toBe(0);
      expect(outOfRange.expense).toBe(0);
    });
  });

  describe("computeHealth", () => {
    it("devuelve Brote Inicial cuando no hay transacciones", () => {
      const result = computeHealth([], [], []);
      expect(result.score).toBeNull();
      expect(result.state).toBe("unrated");
      expect(result.label).toBe("Brote Inicial");
      expect(result.hasTransactions).toBe(false);
    });

    it("evalúa salud excelente cuando hay ahorro elevado y bajo gasto", () => {
      const cur = monthRange(0);
      const txs: Transaction[] = [
        {
          id: "1",
          user_id: "u1",
          type: "income",
          amount: 5000000,
          currency: "COP",
          category_id: "cat_sal",
          transaction_date: cur.start,
          payment_method: "transfer",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
        {
          id: "2",
          user_id: "u1",
          type: "expense",
          amount: 1000000,
          currency: "COP",
          category_id: "cat_food",
          transaction_date: cur.start,
          payment_method: "debit",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
      ];
      const health = computeHealth(txs, [], MOCK_CATEGORIES);
      expect(health.score).toBeGreaterThanOrEqual(75);
      expect(["excellent", "healthy"]).toContain(health.state);
    });

    it("evalúa riesgo o crítico cuando el gasto en débito supera los ingresos", () => {
      const cur = monthRange(0);
      const txs: Transaction[] = [
        {
          id: "1",
          user_id: "u1",
          type: "income",
          amount: 1000000,
          currency: "COP",
          category_id: "cat_sal",
          transaction_date: cur.start,
          payment_method: "transfer",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
        {
          id: "2",
          user_id: "u1",
          type: "expense",
          amount: 2500000,
          currency: "COP",
          category_id: "cat_food",
          transaction_date: cur.start,
          payment_method: "debit",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
      ];
      const health = computeHealth(txs, [], MOCK_CATEGORIES);
      expect(health.score).toBeLessThanOrEqual(55);
      expect(["risk", "critical", "attention"]).toContain(health.state);
    });

    it("penaliza por presupuestos excedidos", () => {
      const cur = monthRange(0);
      const txs: Transaction[] = [
        {
          id: "1",
          user_id: "u1",
          type: "expense",
          amount: 800000,
          currency: "COP",
          category_id: "cat_food",
          transaction_date: cur.start,
          payment_method: "debit",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
      ];
      const budgets: Budget[] = [
        {
          id: "b1",
          user_id: "u1",
          category_id: "cat_food",
          amount: 500000, // Superado por 300.000
          currency: "COP",
          period: "monthly",
          start_date: cur.start,
        },
      ];
      const health = computeHealth(txs, budgets, MOCK_CATEGORIES);
      expect(health.reasons.some((r) => r.includes("Superaste"))).toBe(true);
    });
  });

  describe("healthState & healthLabel", () => {
    it("mapea rangos correctamente", () => {
      expect(healthState(95)).toBe("excellent");
      expect(healthState(90)).toBe("excellent");
      expect(healthState(85)).toBe("healthy");
      expect(healthState(75)).toBe("healthy");
      expect(healthState(65)).toBe("attention");
      expect(healthState(55)).toBe("attention");
      expect(healthState(45)).toBe("risk");
      expect(healthState(30)).toBe("risk");
      expect(healthState(25)).toBe("critical");
      expect(healthState(0)).toBe("critical");
      expect(healthState(null)).toBe("unrated");

      expect(healthLabel(95)).toBe("Excelente");
      expect(healthLabel(80)).toBe("Saludable");
      expect(healthLabel(60)).toBe("Atención");
      expect(healthLabel(40)).toBe("Riesgo");
      expect(healthLabel(20)).toBe("Crítico");
      expect(healthLabel(null)).toBe("Brote Inicial");
    });
  });

  describe("categoryBreakdown", () => {
    const cur = monthRange(0);
    const txs: Transaction[] = [
      {
        id: "1",
        user_id: "u1",
        type: "expense",
        amount: 300000,
        currency: "COP",
        category_id: "cat_food",
        transaction_date: cur.start,
        payment_method: "debit",
        is_recurring: false,
        recurring_rule: null,
        description: null,
        notes: null,
        created_at: "",
      },
      {
        id: "2",
        user_id: "u1",
        type: "expense",
        amount: 700000,
        currency: "COP",
        category_id: "cat_fun",
        transaction_date: cur.start,
        payment_method: "cash",
        is_recurring: false,
        recurring_rule: null,
        description: null,
        notes: null,
        created_at: "",
      },
    ];

    it("ordena por mayor importe y calcula el porcentaje", () => {
      const breakdown = categoryBreakdown(txs, MOCK_CATEGORIES, cur.start, cur.end, "expense");
      expect(breakdown).toHaveLength(2);
      expect(breakdown[0].id).toBe("cat_fun");
      expect(breakdown[0].amount).toBe(700000);
      expect(breakdown[0].share).toBe(70);
      expect(breakdown[1].id).toBe("cat_food");
      expect(breakdown[1].amount).toBe(300000);
      expect(breakdown[1].share).toBe(30);
    });

    it("etiqueta correctamente transacciones sin categoría", () => {
      const noCatTx: Transaction = {
        id: "3",
        user_id: "u1",
        type: "expense",
        amount: 100000,
        currency: "COP",
        category_id: null,
        transaction_date: cur.start,
        payment_method: "cash",
        is_recurring: false,
        recurring_rule: null,
        description: null,
        notes: null,
        created_at: "",
      };
      const breakdown = categoryBreakdown([noCatTx], MOCK_CATEGORIES, cur.start, cur.end);
      expect(breakdown[0].name).toBe("Sin categoría");
      expect(breakdown[0].emoji).toBe("📦");
    });
  });

  describe("monthlySeries", () => {
    it("genera 6 meses por defecto en orden cronológico", () => {
      const series = monthlySeries([], 6, "debit");
      expect(series).toHaveLength(6);
      expect(series[0]).toHaveProperty("label");
      expect(series[0]).toHaveProperty("income");
      expect(series[0]).toHaveProperty("expense");
      expect(series[0]).toHaveProperty("balance");
    });
  });

  describe("dailySeries", () => {
    it("agrupa importes por día", () => {
      const cur = monthRange(0);
      const txs: Transaction[] = [
        {
          id: "1",
          user_id: "u1",
          type: "income",
          amount: 500,
          currency: "COP",
          category_id: null,
          transaction_date: cur.start,
          payment_method: "cash",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
        {
          id: "2",
          user_id: "u1",
          type: "expense",
          amount: 200,
          currency: "COP",
          category_id: null,
          transaction_date: cur.start,
          payment_method: "cash",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
      ];
      const daily = dailySeries(txs, cur.start, cur.end);
      expect(daily.length).toBeGreaterThanOrEqual(1);
      const day = daily.find((d) => d.label === cur.start.slice(8));
      expect(day?.income).toBe(500);
      expect(day?.expense).toBe(200);
    });
  });

  describe("buildInsights", () => {
    it("devuelve aviso si los gastos en débito superan ingresos", () => {
      const cur = monthRange(0);
      const txs: Transaction[] = [
        {
          id: "1",
          user_id: "u1",
          type: "income",
          amount: 1000,
          currency: "COP",
          category_id: null,
          transaction_date: cur.start,
          payment_method: "cash",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
        {
          id: "2",
          user_id: "u1",
          type: "expense",
          amount: 2000,
          currency: "COP",
          category_id: null,
          transaction_date: cur.start,
          payment_method: "cash",
          is_recurring: false,
          recurring_rule: null,
          description: null,
          notes: null,
          created_at: "",
        },
      ];
      const insights = buildInsights(txs, MOCK_CATEGORIES, []);
      expect(insights.some((i) => i.tone === "bad")).toBe(true);
    });

    it("no genera errores con presupuestos de importe 0", () => {
      const budgets: Budget[] = [
        {
          id: "b0",
          user_id: "u1",
          category_id: "cat_food",
          amount: 0,
          currency: "COP",
          period: "monthly",
          start_date: "2026-01-01",
        },
      ];
      expect(() => buildInsights([], MOCK_CATEGORIES, budgets)).not.toThrow();
    });
  });

  describe("clamp", () => {
    it("acota el valor entre mínimo y máximo", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});
