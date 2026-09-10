import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useBudgets, useCategories, useChallenges, useProfile, useTransactions } from "@/lib/data";
import {
  buildInsights,
  categoryBreakdown,
  computeHealth,
  dailySeries,
  monthlySeries,
  totalsFor,
} from "@/lib/finance";
import { formatMoney, monthLabel, monthRange } from "@/lib/format";
import { buildReportHtml } from "@/lib/report";

export const Route = createFileRoute("/_authenticated/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes — PlantWallet" },
      {
        name: "description",
        content: "Evolución de tus ingresos y gastos, categorías principales y reporte PDF descargable.",
      },
      { property: "og:title", content: "Reportes — PlantWallet" },
      { property: "og:description", content: "Analiza tus finanzas mes a mes." },
    ],
  }),
  component: Reportes,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function Reportes() {
  const { data: profile } = useProfile();
  const { data: txs = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();
  const { data: challenges = [] } = useChallenges();
  const [offset, setOffset] = useState(0);

  const currency = profile?.base_currency ?? "COP";
  const range = monthRange(offset);
  const totals = useMemo(() => totalsFor(txs, range.start, range.end), [txs, range.start, range.end]);
  const prevTotals = useMemo(() => {
    const r = monthRange(offset - 1);
    return totalsFor(txs, r.start, r.end);
  }, [txs, offset]);
  const breakdown = useMemo(
    () => categoryBreakdown(txs, categories, range.start, range.end),
    [txs, categories, range.start, range.end],
  );
  const months = useMemo(() => monthlySeries(txs, 6), [txs]);
  const daily = useMemo(() => dailySeries(txs, range.start, range.end), [txs, range.start, range.end]);
  const health = useMemo(() => computeHealth(txs, budgets, categories), [txs, budgets, categories]);

  const avgDaily = totals.expense / new Date(range.end).getDate();
  const variation =
    prevTotals.expense > 0
      ? Math.round(((totals.expense - prevTotals.expense) / prevTotals.expense) * 100)
      : 0;

  function exportPdf() {
    const html = buildReportHtml({
      userName: profile?.name || "Usuario",
      period: monthLabel(offset),
      currency,
      income: totals.income,
      expense: totals.expense,
      balance: totals.balance,
      savingsRate: totals.savingsRate,
      healthScore: health.score,
      healthLabel: health.label,
      categories: breakdown.slice(0, 10),
      months,
      insights: buildInsights(txs, categories, budgets).map((i) => i.text),
      completedChallenges: challenges.filter((c) => c.status === "completed").length,
      growthPoints: profile?.growth_points ?? 0,
    });
    const w = window.open("", "_blank");
    if (!w) return toast.error("Permite las ventanas emergentes para generar el reporte.");
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-muted-foreground capitalize">{monthLabel(offset)}</p>
        </div>
        <Button variant="secondary" className="h-11 rounded-xl" onClick={exportPdf}>
          Exportar PDF
        </Button>
      </header>

      <div className="flex gap-2">
        <Button variant="secondary" className="h-11 flex-1 rounded-xl" onClick={() => setOffset((o) => o - 1)}>
          ← Mes anterior
        </Button>
        <Button
          variant="secondary"
          className="h-11 flex-1 rounded-xl"
          disabled={offset >= 0}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
        >
          Mes siguiente →
        </Button>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <Kpi label="Ingresos" value={formatMoney(totals.income, currency)} />
        <Kpi label="Gastos" value={formatMoney(totals.expense, currency)} />
        <Kpi label="Balance" value={formatMoney(totals.balance, currency)} />
        <Kpi label="Tasa de ahorro" value={`${Math.round(totals.savingsRate * 100)}%`} />
        <Kpi label="Gasto diario promedio" value={formatMoney(avgDaily, currency)} />
        <Kpi
          label="Variación vs mes anterior"
          value={`${variation > 0 ? "+" : ""}${variation}%`}
        />
      </section>

      {totals.count === 0 ? (
        <EmptyState
          emoji="📊"
          title="Sin datos en este período"
          description="Registra movimientos para ver aquí tus gráficos y comparaciones."
        />
      ) : (
        <>
          <section className="surface p-4">
            <h2 className="text-base font-semibold">Ingresos vs gastos (6 meses)</h2>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v, currency)}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="income" name="Ingresos" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Gastos" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="surface p-4">
            <h2 className="text-base font-semibold">Gastos por categoría</h2>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown.slice(0, 6)}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                  >
                    {breakdown.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatMoney(v, currency)}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ol className="mt-2 space-y-1.5 text-sm">
              {breakdown.slice(0, 6).map((c, i) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      aria-hidden
                    />
                    <span className="truncate">
                      {c.emoji} {c.name}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatMoney(c.amount, currency)} · {c.share}%
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="surface p-4">
            <h2 className="text-base font-semibold">Gasto diario del mes</h2>
            <div className="mt-3 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v, currency)}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="expense" name="Gastos" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="income" name="Ingresos" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
