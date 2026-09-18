import type { Budget, Category, Transaction } from "./types";
import { monthRange } from "./format";

export interface AccountTotals {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  count: number;
}

export interface CreditTotals {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export interface PeriodTotals {
  income: number;
  expense: number;
  balance: number;
  totalExpense: number;
  savingsRate: number;
  count: number;
  debit: AccountTotals;
  credit: CreditTotals;
}

export function isCreditTx(t: { payment_method?: string | null }): boolean {
  return t.payment_method === "credit";
}

export function totalsFor(txs: Transaction[], start: string, end: string): PeriodTotals {
  const inRange = txs.filter((t) => t.transaction_date >= start && t.transaction_date <= end);
  const debitTxs = inRange.filter((t) => !isCreditTx(t));
  const creditTxs = inRange.filter((t) => isCreditTx(t));

  const debitIncome = sum(debitTxs.filter((t) => t.type === "income"));
  const debitExpense = sum(debitTxs.filter((t) => t.type === "expense"));
  const debitBalance = debitIncome - debitExpense;
  const debitSavingsRate = debitIncome > 0 ? Math.max(0, debitBalance / debitIncome) : 0;

  const creditIncome = sum(creditTxs.filter((t) => t.type === "income"));
  const creditExpense = sum(creditTxs.filter((t) => t.type === "expense"));
  const creditBalance = creditExpense - creditIncome;

  return {
    income: debitIncome,
    expense: debitExpense,
    balance: debitBalance,
    totalExpense: debitExpense + creditExpense,
    savingsRate: debitSavingsRate,
    count: inRange.length,
    debit: {
      income: debitIncome,
      expense: debitExpense,
      balance: debitBalance,
      savingsRate: debitSavingsRate,
      count: debitTxs.length,
    },
    credit: {
      income: creditIncome,
      expense: creditExpense,
      balance: creditBalance,
      count: creditTxs.length,
    },
  };
}

export function sum(txs: Transaction[]) {
  return txs.reduce((acc, t) => acc + Number(t.amount), 0);
}

/** Pesos del algoritmo de salud financiera — fáciles de ajustar en un solo lugar. */
export const HEALTH_WEIGHTS = {
  savingsCapacity: 30,
  incomeExpenseRatio: 25,
  budgetCompliance: 20,
  trend: 15,
  stability: 10,
};

export interface HealthResult {
  score: number | null;
  hasTransactions: boolean;
  label: string;
  state: "excellent" | "healthy" | "attention" | "risk" | "critical" | "unrated";
  reasons: string[];
  current: PeriodTotals;
  previous: PeriodTotals;
}

export function computeHealth(
  txs: Transaction[],
  budgets: Budget[],
  categories: Category[],
): HealthResult {
  const cur = monthRange(0);
  const prev = monthRange(-1);
  const current = totalsFor(txs, cur.start, cur.end);
  const previous = totalsFor(txs, prev.start, prev.end);
  const reasons: string[] = [];

  // Cuando el usuario no tiene movimientos registrados (estado inicial / semilla / brote)
  const totalCount = txs.length;
  if (totalCount === 0 || (current.debit.count === 0 && current.credit.count === 0 && previous.debit.count === 0)) {
    return {
      score: null,
      hasTransactions: false,
      label: "Brote Inicial",
      state: "unrated",
      reasons: [
        "Tu planta está en estado de semilla/brote 🌱",
        "Registra tu primer ingreso o gasto para comenzar a medir tu salud financiera.",
        "Tus compras a crédito se gestionan por separado para proteger tu liquidez.",
      ],
      current,
      previous,
    };
  }

  // 1. Capacidad de ahorro (basada en el flujo real de débito / liquidez)
  const rate = current.debit.savingsRate;
  const savings = clamp(rate / 0.2, 0, 1) * HEALTH_WEIGHTS.savingsCapacity;

  // 2. Relación ingresos / gastos (débito: el crédito no resta del débito para no falsear liquidez)
  const ratio = current.debit.income > 0 ? current.debit.expense / current.debit.income : current.debit.expense > 0 ? 2 : 0;
  const ratioScore = clamp(1 - (ratio - 0.5) / 0.7, 0, 1) * HEALTH_WEIGHTS.incomeExpenseRatio;

  // 3. Cumplimiento de presupuestos
  let budgetScore = HEALTH_WEIGHTS.budgetCompliance;
  const active = budgets.filter((b) => b.category_id);
  if (active.length) {
    const ok = active.filter((b) => {
      const spent = sum(
        txs.filter(
          (t) =>
            t.type === "expense" &&
            t.category_id === b.category_id &&
            t.transaction_date >= cur.start &&
            t.transaction_date <= cur.end,
        ),
      );
      return spent <= Number(b.amount);
    }).length;
    budgetScore = (ok / active.length) * HEALTH_WEIGHTS.budgetCompliance;
    if (ok < active.length) {
      reasons.push(`Superaste ${active.length - ok} de tus ${active.length} presupuestos este mes.`);
    }
  }

  // 4. Tendencia (basada en gastos de débito para reflejar el comportamiento recurrente)
  let trendScore = HEALTH_WEIGHTS.trend;
  if (previous.debit.expense > 0) {
    const delta = (current.debit.expense - previous.debit.expense) / previous.debit.expense;
    trendScore = clamp(0.6 - delta * 2, 0, 1) * HEALTH_WEIGHTS.trend;
    if (delta > 0.1) {
      reasons.push(`Tus gastos en débito subieron ${Math.round(delta * 100)}% frente al mes anterior.`);
    } else if (delta < -0.05) {
      reasons.push(`Tus gastos en débito bajaron ${Math.abs(Math.round(delta * 100))}% frente al mes anterior.`);
    }
  } else if (current.debit.expense === 0 && current.debit.income > 0) {
    // Rendimiento perfecto: cero gastos e ingresos positivos
    trendScore = HEALTH_WEIGHTS.trend;
  } else if (current.debit.expense > 0 && current.debit.income > 0) {
    // Primer mes con movimientos saludables: proporcional a la tasa de ahorro
    trendScore = clamp(0.7 + (rate * 0.3), 0.7, 1) * HEALTH_WEIGHTS.trend;
  }

  // 5. Estabilidad (variabilidad de los últimos 3 meses en débito)
  const months = [0, -1, -2].map((o) => {
    const r = monthRange(o);
    return totalsFor(txs, r.start, r.end).debit.expense;
  });
  const avg = months.reduce((a, b) => a + b, 0) / 3;
  const variance = avg > 0 ? Math.sqrt(months.reduce((a, b) => a + (b - avg) ** 2, 0) / 3) / avg : 0;
  const stability = clamp(1 - variance, 0, 1) * HEALTH_WEIGHTS.stability;

  const raw = savings + ratioScore + budgetScore + trendScore + stability;
  const score = Math.round(clamp(raw, 0, 100));

  if (current.debit.income === 0 && current.debit.expense === 0) {
    reasons.unshift("Aún no hay movimientos en débito este mes: registra uno para calcular tu salud.");
  } else if (current.debit.balance < 0) {
    reasons.unshift("Este mes tus gastos en débito superan tus ingresos.");
  } else if (current.debit.expense === 0 && current.debit.income > 0) {
    reasons.unshift("¡Impecable! Cero gastos registrados y 100% de ahorro este mes.");
  } else if (rate >= 0.2) {
    reasons.unshift(`Estás ahorrando el ${Math.round(rate * 100)}% de tus ingresos líquidos.`);
  }

  if (current.credit.expense > 0) {
    reasons.push(`Tus compras a crédito se gestionan por separado para proteger tu salud financiera líquida.`);
  }

  const topExpense = topCategory(txs, categories, cur.start, cur.end);
  if (topExpense) {
    reasons.push(`${topExpense.emoji} ${topExpense.name} concentra el ${topExpense.share}% de tus gastos.`);
  }

  return { score, hasTransactions: true, label: healthLabel(score), state: healthState(score), reasons, current, previous };
}

export function healthState(score: number | null): HealthResult["state"] {
  if (score === null) return "unrated";
  if (score >= 90) return "excellent";
  if (score >= 75) return "healthy";
  if (score >= 55) return "attention";
  if (score >= 30) return "risk";
  return "critical";
}

export function healthLabel(score: number | null) {
  if (score === null) return "Brote Inicial";
  return {
    unrated: "Brote Inicial",
    excellent: "Excelente",
    healthy: "Saludable",
    attention: "Atención",
    risk: "Riesgo",
    critical: "Crítico",
  }[healthState(score)];
}

export function categoryBreakdown(
  txs: Transaction[],
  categories: Category[],
  start: string,
  end: string,
  type: "expense" | "income" = "expense",
) {
  const inRange = txs.filter(
    (t) => t.type === type && t.transaction_date >= start && t.transaction_date <= end,
  );
  const total = sum(inRange);
  const map = new Map<string, number>();
  for (const t of inRange) {
    const key = t.category_id ?? "none";
    map.set(key, (map.get(key) ?? 0) + Number(t.amount));
  }
  return [...map.entries()]
    .map(([id, amount]) => {
      const cat = categories.find((c) => c.id === id);
      return {
        id,
        name: cat?.name ?? "Sin categoría",
        emoji: cat?.emoji ?? "📦",
        essential: cat?.is_essential ?? false,
        amount,
        share: total > 0 ? Math.round((amount / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

function topCategory(txs: Transaction[], categories: Category[], start: string, end: string) {
  return categoryBreakdown(txs, categories, start, end)[0];
}

export function monthlySeries(
  txs: Transaction[],
  monthsBack = 6,
  accountType: "debit" | "credit" | "all" = "debit",
) {
  const out: { label: string; income: number; expense: number; balance: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const r = monthRange(-i);
    const t = totalsFor(txs, r.start, r.end);
    const d = new Date();
    const label = new Intl.DateTimeFormat("es-CO", { month: "short" }).format(
      new Date(d.getFullYear(), d.getMonth() - i, 1),
    );
    if (accountType === "credit") {
      out.push({ label, income: t.credit.income, expense: t.credit.expense, balance: t.credit.balance });
    } else if (accountType === "debit") {
      out.push({ label, income: t.debit.income, expense: t.debit.expense, balance: t.debit.balance });
    } else {
      out.push({ label, income: t.income, expense: t.expense, balance: t.balance });
    }
  }
  return out;
}

export function dailySeries(txs: Transaction[], start: string, end: string) {
  const map = new Map<string, { income: number; expense: number }>();
  for (const t of txs) {
    if (t.transaction_date < start || t.transaction_date > end) continue;
    const cur = map.get(t.transaction_date) ?? { income: 0, expense: 0 };
    cur[t.type] += Number(t.amount);
    map.set(t.transaction_date, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ label: date.slice(8), ...v }));
}

export function buildInsights(
  txs: Transaction[],
  categories: Category[],
  budgets: Budget[],
): { tone: "good" | "warn" | "bad" | "info"; text: string }[] {
  const cur = monthRange(0);
  const prev = monthRange(-1);
  const c = totalsFor(txs, cur.start, cur.end);
  const p = totalsFor(txs, prev.start, prev.end);
  const out: { tone: "good" | "warn" | "bad" | "info"; text: string }[] = [];

  if (c.debit.expense > c.debit.income && c.debit.income > 0) {
    out.push({ tone: "bad", text: "Tus gastos en débito superaron tus ingresos este mes. Revisemos juntos qué categorías lo están impulsando." });
  }
  if (c.debit.savingsRate >= 0.1 && c.debit.income > 0) {
    out.push({ tone: "good", text: `Llevas un ahorro del ${Math.round(c.debit.savingsRate * 100)}% de tus ingresos líquidos este mes.` });
  }
  if (p.debit.expense > 0 && c.debit.expense > p.debit.expense * 1.15) {
    out.push({ tone: "warn", text: `Tu gasto en débito creció ${Math.round(((c.debit.expense - p.debit.expense) / p.debit.expense) * 100)}% respecto al mes pasado.` });
  }
  if (c.credit.expense > 0) {
    out.push({ tone: "info", text: "Tus consumos a crédito se mantienen separados de tu saldo de débito para no comprometer tu liquidez." });
  }

  const breakdown = categoryBreakdown(txs, categories, cur.start, cur.end);
  const prevBreakdown = categoryBreakdown(txs, categories, prev.start, prev.end);
  for (const cat of breakdown.slice(0, 3)) {
    const before = prevBreakdown.find((b) => b.id === cat.id)?.amount ?? 0;
    if (before > 0 && cat.amount > before * 1.25) {
      out.push({ tone: "warn", text: `${cat.emoji} ${cat.name} aumentó ${Math.round(((cat.amount - before) / before) * 100)}% este mes.` });
    } else if (cat.share >= 25) {
      out.push({ tone: "info", text: `${cat.emoji} ${cat.name} representa el ${cat.share}% de tus gastos.` });
    }
  }

  for (const b of budgets) {
    const cat = categories.find((x) => x.id === b.category_id);
    if (!cat) continue;
    const spent = sum(
      txs.filter(
        (t) =>
          t.category_id === b.category_id &&
          t.type === "expense" &&
          t.transaction_date >= cur.start &&
          t.transaction_date <= cur.end,
      ),
    );
    const pct = Math.round((spent / Number(b.amount)) * 100);
    if (pct >= 100) out.push({ tone: "bad", text: `Superaste tu presupuesto de ${cat.name} (${pct}%).` });
    else if (pct >= 80) out.push({ tone: "warn", text: `Has usado el ${pct}% de tu presupuesto de ${cat.name}.` });
  }

  if (!out.length) {
    out.push({ tone: "info", text: "Registra algunos movimientos más y aquí verás recomendaciones basadas en tus datos reales." });
  }
  return out.slice(0, 6);
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
