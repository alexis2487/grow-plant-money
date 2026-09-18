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
import { Wallet, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { useBudgets, useCategories, useChallenges, useProfile, useTransactions } from "@/lib/data";
import {
  buildInsights,
  categoryBreakdown,
  computeHealth,
  dailySeries,
  isCreditTx,
  monthlySeries,
  totalsFor,
} from "@/lib/finance";
import { monthRange } from "@/lib/format";
import { buildReportHtml } from "@/lib/report";
import { useTranslation } from "@/i18n";

export const Route = createFileRoute("/_authenticated/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes — PlantWallet" },
      {
        name: "description",
        content:
          "Reportes financieros independientes de débito y tarjeta de crédito, categorías y PDF exportable.",
      },
      { property: "og:title", content: "Reportes — PlantWallet" },
      {
        property: "og:description",
        content: "Analiza tus finanzas en débito y tarjeta de crédito mes a mes.",
      },
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
  const { t, formatMoney, monthLabel } = useTranslation();
  const { data: profile } = useProfile();
  const { data: txs = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();
  const { data: challenges = [] } = useChallenges();
  const [offset, setOffset] = useState(0);
  const [reportType, setReportType] = useState<"debit" | "credit">("debit");

  const currency = profile?.base_currency ?? "COP";
  const range = monthRange(offset);

  // Filtrar movimientos según el tipo de reporte seleccionado (débito o crédito)
  const filteredTxs = useMemo(() => {
    return txs.filter((t) => (reportType === "credit" ? isCreditTx(t) : !isCreditTx(t)));
  }, [txs, reportType]);

  const totals = useMemo(
    () => totalsFor(txs, range.start, range.end),
    [txs, range.start, range.end],
  );
  const prevTotals = useMemo(() => {
    const r = monthRange(offset - 1);
    return totalsFor(txs, r.start, r.end);
  }, [txs, offset]);

  const breakdown = useMemo(
    () => categoryBreakdown(filteredTxs, categories, range.start, range.end),
    [filteredTxs, categories, range.start, range.end],
  );

  const months = useMemo(() => monthlySeries(txs, 6, reportType), [txs, reportType]);
  const daily = useMemo(
    () => dailySeries(filteredTxs, range.start, range.end),
    [filteredTxs, range.start, range.end],
  );
  const health = useMemo(() => computeHealth(txs, budgets, categories), [txs, budgets, categories]);

  // Cálculos específicos para el reporte activo (evitar bug de zona horaria UTC con parseInt)
  const daysInMonth = parseInt(range.end.slice(8, 10), 10) || 30;
  const isCredit = reportType === "credit";

  const currentExpense = isCredit ? totals.credit.expense : totals.debit.expense;
  const currentIncome = isCredit ? totals.credit.income : totals.debit.income;
  const currentBalance = isCredit ? totals.credit.balance : totals.debit.balance;
  const currentCount = isCredit ? totals.credit.count : totals.debit.count;

  const prevExpense = isCredit ? prevTotals.credit.expense : prevTotals.debit.expense;
  const avgDaily = currentExpense / daysInMonth;
  const variation =
    prevExpense > 0 ? Math.round(((currentExpense - prevExpense) / prevExpense) * 100) : 0;

  function exportPdf() {
    const html = buildReportHtml({
      userName: profile?.name || "Usuario",
      period: monthLabel(offset),
      currency,
      reportType,
      income: currentIncome,
      expense: currentExpense,
      balance: currentBalance,
      savingsRate: totals.debit.savingsRate,
      healthScore: health.score,
      healthLabel: health.label,
      transactionCount: currentCount,
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

      {/* SELECTOR DE TIPO DE REPORTE: DÉBITO VS CRÉDITO */}
      <Tabs
        value={reportType}
        onValueChange={(v) => setReportType(v as "debit" | "credit")}
        className="w-full"
      >
        <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-secondary p-1">
          <TabsTrigger
            value="debit"
            className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Wallet className="h-4 w-4 text-success" />
            <span>Reporte Débito</span>
          </TabsTrigger>
          <TabsTrigger
            value="credit"
            className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <CreditCard className="h-4 w-4 text-warning" />
            <span>Tarjeta de Crédito</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* NAVEGACIÓN ENTRE MESES */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="h-11 flex-1 rounded-xl"
          onClick={() => setOffset((o) => o - 1)}
        >
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

      {/* TARJETAS KPI ADAPTADAS */}
      {isCredit ? (
        <section className="grid grid-cols-2 gap-3">
          <Kpi
            label="Compras con crédito"
            value={formatMoney(totals.credit.expense, currency)}
            highlight="warning"
          />
          <Kpi
            label="Pagos a la tarjeta"
            value={formatMoney(totals.credit.income, currency)}
            highlight="success"
          />
          <Kpi label="Saldo adeudado neto" value={formatMoney(totals.credit.balance, currency)} />
          <Kpi label="Movimientos a crédito" value={`${totals.credit.count} movimientos`} />
          <Kpi label="Consumo diario promedio" value={formatMoney(avgDaily, currency)} />
          <Kpi
            label="Variación vs mes anterior"
            value={`${variation > 0 ? "+" : ""}${variation}%`}
          />
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-3">
          <Kpi
            label="Ingresos líquidos"
            value={formatMoney(totals.debit.income, currency)}
            highlight="success"
          />
          <Kpi label="Gastos en débito" value={formatMoney(totals.debit.expense, currency)} />
          <Kpi label="Balance del mes" value={formatMoney(totals.debit.balance, currency)} />
          <Kpi
            label="Tasa de ahorro"
            value={`${Math.round(totals.debit.savingsRate * 100)}%`}
            highlight="success"
          />
          <Kpi label="Gasto diario promedio" value={formatMoney(avgDaily, currency)} />
          <Kpi
            label="Variación vs mes anterior"
            value={`${variation > 0 ? "+" : ""}${variation}%`}
          />
        </section>
      )}

      {currentCount === 0 ? (
        <EmptyState
          emoji={isCredit ? "💳" : "📊"}
          title={
            isCredit ? "Sin compras a crédito en este mes" : "Sin movimientos en débito en este mes"
          }
          description={
            isCredit
              ? "No se han registrado consumos con tarjeta de crédito en este período."
              : "Registra movimientos en efectivo o débito para ver aquí tus gráficos y comparaciones."
          }
        />
      ) : (
        <>
          {/* GRÁFICO HISTÓRICO 6 MESES */}
          <section className="surface p-4">
            <h2 className="text-base font-semibold">
              {isCredit
                ? "Compras a crédito vs Pagos (6 meses)"
                : "Ingresos vs gastos en débito (6 meses)"}
            </h2>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v, currency)}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  {isCredit ? (
                    <>
                      <Bar
                        dataKey="expense"
                        name="Compras a Crédito"
                        fill="hsl(var(--warning))"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="income"
                        name="Pagos / Abonos"
                        fill="hsl(var(--success))"
                        radius={[6, 6, 0, 0]}
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        dataKey="income"
                        name="Ingresos Débito"
                        fill="var(--chart-1)"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="expense"
                        name="Gastos Débito"
                        fill="var(--chart-4)"
                        radius={[6, 6, 0, 0]}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* GRÁFICO POR CATEGORÍA */}
          <section className="surface p-4">
            <h2 className="text-base font-semibold">
              {isCredit ? "Compras a crédito por categoría" : "Gastos en débito por categoría"}
            </h2>
            {breakdown.length ? (
              <>
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
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No hay categorías registradas en este período.
              </p>
            )}
          </section>

          {/* GRÁFICO DIARIO */}
          <section className="surface p-4">
            <h2 className="text-base font-semibold">
              {isCredit
                ? "Consumo diario con tarjeta de crédito"
                : "Gasto diario del mes en débito"}
            </h2>
            <div className="mt-3 h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v, currency)}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  {isCredit ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey="expense"
                        name="Compras a Crédito"
                        stroke="hsl(var(--warning))"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Pagos Tarjeta"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </>
                  ) : (
                    <>
                      <Line
                        type="monotone"
                        dataKey="expense"
                        name="Gastos Débito"
                        stroke="var(--chart-4)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Ingresos Débito"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "success" | "warning";
}) {
  return (
    <div className="surface p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold tabular-nums ${
          highlight === "success" ? "text-success" : highlight === "warning" ? "text-warning" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
