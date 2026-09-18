import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Plus, Minus, Wallet, CreditCard, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HealthCard } from "@/components/HealthCard";
import { ChallengeCard } from "@/components/ChallengeCard";
import { EmptyState } from "@/components/EmptyState";
import { useTransactionSheet } from "./route";
import {
  useBudgets,
  useCategories,
  useChallenges,
  useMyPlantItems,
  usePlantCatalog,
  useProfile,
  useTransactions,
} from "@/lib/data";
import { buildInsights, categoryBreakdown, computeHealth, sum } from "@/lib/finance";
import { formatMoney, greeting, monthLabel, monthRange } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/inicio")({
  head: () => ({
    meta: [
      { title: "Inicio — PlantWallet" },
      { name: "description", content: "Tu salud financiera, balance del mes, retos activos y últimos movimientos." },
      { property: "og:title", content: "Inicio — PlantWallet" },
      { property: "og:description", content: "Tu salud financiera de un vistazo." },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  const { data: profile } = useProfile();
  const { data: txs, isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();
  const { data: challenges = [] } = useChallenges();
  const { data: catalog = [] } = usePlantCatalog();
  const { data: mine = [] } = useMyPlantItems();
  const sheet = useTransactionSheet();

  const currency = profile?.base_currency ?? "COP";
  const range = monthRange(0);

  const equipped = useMemo(() => {
    const codes: Record<string, string> = {};
    for (const item of mine.filter((m) => m.equipped)) {
      const cat = catalog.find((c) => c.id === item.plant_item_id);
      if (cat) codes[cat.item_type] = cat.code;
    }
    return codes;
  }, [mine, catalog]);

  const health = useMemo(
    () => computeHealth(txs ?? [], budgets, categories),
    [txs, budgets, categories],
  );
  const breakdown = useMemo(
    () => categoryBreakdown(txs ?? [], categories, range.start, range.end).slice(0, 5),
    [txs, categories, range.start, range.end],
  );
  const insights = useMemo(
    () => buildInsights(txs ?? [], categories, budgets),
    [txs, categories, budgets],
  );

  const activeChallenges = challenges.filter((c) => c.status === "active");
  const recent = (txs ?? []).slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-52 w-full rounded-3xl" />
        <Skeleton className="h-28 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{greeting(profile?.name)}</h1>
        <p className="text-sm text-muted-foreground capitalize">{monthLabel(0)}</p>
      </header>

      <HealthCard
        health={health}
        plantStyle={equipped.plant}
        potStyle={equipped.pot}
        effect={equipped.effect}
      />

      <section className="surface p-5">
        <Tabs defaultValue="debit" className="w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Balance del mes
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Débito y crédito separados para una salud financiera real
              </p>
            </div>
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-secondary p-1 sm:w-64">
              <TabsTrigger
                value="debit"
                className="flex flex-col items-center justify-center rounded-xl py-1 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-1">
                  <Wallet className="h-3 w-3 text-success" aria-hidden /> Débito
                </span>
                <span className="text-[11px] font-normal tabular-nums text-muted-foreground">
                  {formatMoney(health.current.debit.balance, currency)}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="credit"
                className="flex flex-col items-center justify-center rounded-xl py-1 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-warning" aria-hidden /> Crédito
                </span>
                <span className="text-[11px] font-normal tabular-nums text-muted-foreground">
                  {formatMoney(health.current.credit.expense, currency)}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* BALANCE DÉBITO */}
          <TabsContent value="debit" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Balance del mes (Débito)</span>
                <p
                  className={`mt-1 text-3xl font-bold tabular-nums ${
                    health.current.debit.balance < 0 ? "text-danger" : ""
                  }`}
                >
                  {formatMoney(health.current.debit.balance, currency)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                Dinero disponible
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-success">
                  {formatMoney(health.current.debit.income, currency)}
                </p>
              </div>
              <div className="rounded-2xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Gastos en débito</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {formatMoney(health.current.debit.expense, currency)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {health.current.debit.income > 0
                ? `Has gastado el ${Math.round(
                    (health.current.debit.expense / health.current.debit.income) * 100,
                  )}% de tus ingresos este mes.`
                : "Registra tus ingresos para ver la relación con tus gastos en débito."}
            </p>

            <div className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success/5 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>
                <strong>Salud protegida:</strong> Las compras con tarjeta de crédito no se restan de tu saldo en débito, preservando la exactitud de tu dinero líquido y tu salud financiera.
              </span>
            </div>
          </TabsContent>

          {/* BALANCE CRÉDITO */}
          <TabsContent value="credit" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Balance del mes (Crédito)</span>
                <p className="mt-1 text-3xl font-bold tabular-nums">
                  {formatMoney(health.current.credit.expense, currency)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
                Tarjeta de crédito
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Consumos del mes</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-warning">
                  {formatMoney(health.current.credit.expense, currency)}
                </p>
              </div>
              <div className="rounded-2xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Abonos / Reembolsos</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-success">
                  {formatMoney(health.current.credit.income, currency)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {health.current.credit.count > 0
                ? `Tienes ${health.current.credit.count} compra${
                    health.current.credit.count > 1 ? "s" : ""
                  } a crédito este mes por un total de ${formatMoney(health.current.credit.expense, currency)}.`
                : "No tienes compras a crédito registradas este mes."}
            </p>

            <div className="flex items-start gap-2.5 rounded-xl border border-warning/20 bg-warning/5 p-3 text-xs text-muted-foreground">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
              <span>
                <strong>Gestión independiente:</strong> El crédito se registra por separado y no reduce tu dinero real en débito, evitando falsas alertas en tu salud financiera.
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => sheet.open("income")}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-secondary text-base font-semibold"
        >
          <Plus className="h-5 w-5 text-success" aria-hidden /> Ingreso
        </button>
        <button
          onClick={() => sheet.open("expense")}
          className="flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground"
        >
          <Minus className="h-5 w-5" aria-hidden /> Gasto
        </button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reto activo</h2>
          <Link to="/retos" className="text-sm text-primary">
            Ver todos
          </Link>
        </div>
        {activeChallenges.length ? (
          activeChallenges.slice(0, 1).map((c) => <ChallengeCard key={c.id} challenge={c} />)
        ) : (
          <EmptyState
            emoji="🌿"
            title="Sin retos activos"
            description="Con unos movimientos más podremos proponerte retos personalizados y realistas."
          />
        )}
      </section>

      <section className="surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Tu progreso</h2>
          <span className="text-sm font-semibold text-primary">
            🌱 {profile?.growth_points ?? 0} Growth Points
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {challenges.filter((c) => c.status === "completed").length} retos completados ·{" "}
          {mine.length} elementos desbloqueados para tu planta.
        </p>
      </section>

      <section className="surface p-5">
        <h2 className="text-base font-semibold">Gastos por categoría</h2>
        {breakdown.length ? (
          <ul className="mt-3 space-y-3">
            {breakdown.map((c) => (
              <li key={c.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    {c.emoji} {c.name}
                  </span>
                  <span className="ml-3 shrink-0 tabular-nums text-muted-foreground">
                    {formatMoney(c.amount, currency)} · {c.share}%
                  </span>
                </div>
                <Progress value={c.share} className="mt-1.5 h-1.5" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Aún no hay gastos este mes.</p>
        )}
      </section>

      {budgets.length > 0 && (
        <section className="surface p-5">
          <h2 className="text-base font-semibold">Presupuestos</h2>
          <ul className="mt-3 space-y-3">
            {budgets.map((b) => {
              const cat = categories.find((c) => c.id === b.category_id);
              const spent = sum(
                (txs ?? []).filter(
                  (t) =>
                    t.type === "expense" &&
                    t.category_id === b.category_id &&
                    t.transaction_date >= range.start &&
                    t.transaction_date <= range.end,
                ),
              );
              const pct = Math.round((spent / Number(b.amount)) * 100);
              return (
                <li key={b.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">
                      {cat?.emoji} {cat?.name ?? "Categoría"}
                    </span>
                    <span className="ml-3 shrink-0 tabular-nums text-muted-foreground">
                      {formatMoney(spent, currency)} / {formatMoney(Number(b.amount), currency)}
                    </span>
                  </div>
                  <Progress value={Math.min(100, pct)} className="mt-1.5 h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pct >= 100 ? "Has superado tu presupuesto." : `Has utilizado el ${pct}%.`}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="surface p-5">
        <h2 className="text-base font-semibold">Consejos para mejorar tus finanzas</h2>
        <ul className="mt-3 space-y-2">
          {insights.map((i, idx) => (
            <li key={idx} className="flex gap-2 text-sm">
              <span aria-hidden>
                {i.tone === "good" ? "🟢" : i.tone === "warn" ? "🟡" : i.tone === "bad" ? "🔴" : "🌱"}
              </span>
              <span className="text-muted-foreground">{i.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Información orientativa basada en tus datos; no es asesoría financiera profesional.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimos movimientos</h2>
          <Link to="/movimientos" className="text-sm text-primary">
            Ver todos
          </Link>
        </div>
        {recent.length ? (
          <ul className="space-y-2">
            {recent.map((t) => {
              const cat = categories.find((c) => c.id === t.category_id);
              return (
                <li key={t.id} className="surface flex items-center gap-3 p-3">
                  <span className="text-xl" aria-hidden>
                    {cat?.emoji ?? "📦"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {t.description || cat?.name || "Movimiento"}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.transaction_date}</p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${t.type === "income" ? "text-success" : ""}`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatMoney(Number(t.amount), t.currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            emoji="🌱"
            title="No tienes movimientos todavía"
            description="Empieza a cultivar tus finanzas agregando tu primer ingreso o gasto."
          />
        )}
      </section>
    </div>
  );
}
