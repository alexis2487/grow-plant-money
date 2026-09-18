import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Minus, Target, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { WidgetConfig, WidgetDataPayload } from "@/lib/widget";
import { computeWidgetData, loadWidgetConfig } from "@/lib/widget";
import { useBudgets, useChallenges, useProfile, useTransactions } from "@/lib/data";
import { useTransactionSheet } from "@/routes/_authenticated/route";
import { cn } from "@/lib/utils";

interface Props {
  config?: WidgetConfig;
  onConfigChange?: (next: WidgetConfig) => void;
}

export function WidgetPreview({ config: controlledConfig, onConfigChange }: Props) {
  const { data: txs = [] } = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const { data: challenges = [] } = useChallenges();
  const { data: profile } = useProfile();
  const sheet = useTransactionSheet();

  const [localConfig, setLocalConfig] = useState<WidgetConfig>(loadWidgetConfig());
  const activeConfig = controlledConfig ?? localConfig;
  const [selectedSize, setSelectedSize] = useState<"2x2" | "4x2" | "4x4">("4x2");

  const [widgetData, setWidgetData] = useState<WidgetDataPayload>(() =>
    computeWidgetData(
      txs,
      budgets,
      challenges,
      activeConfig,
      profile?.base_currency ?? "COP",
    ),
  );

  useEffect(() => {
    const next = computeWidgetData(
      txs,
      budgets,
      challenges,
      activeConfig,
      profile?.base_currency ?? "COP",
    );
    setWidgetData(next);
  }, [txs, budgets, challenges, activeConfig, profile?.base_currency]);

  // Escuchar actualizaciones de sincronización
  useEffect(() => {
    function handleUpdate(e: Event) {
      const detail = (e as CustomEvent<WidgetDataPayload>).detail;
      if (detail) {
        setWidgetData(detail);
      }
    }
    window.addEventListener("plantwallet:widget-updated", handleUpdate);
    return () => window.removeEventListener("plantwallet:widget-updated", handleUpdate);
  }, []);

  const {
    plantEmoji,
    score,
    balance,
    income,
    expense,
    savings,
    goalTitle,
    goalAmount,
    goalPercent,
    goalCompleted,
    privacyMode,
    showBalance,
    showIncome,
    showExpenses,
    showScore,
    showGoals,
  } = widgetData;

  const displayBalance = privacyMode ? "••••••••" : balance;
  const displayIncome = privacyMode ? "••••••••" : income;
  const displayExpense = privacyMode ? "••••••••" : expense;
  const displaySavings = privacyMode ? "••••••••" : savings;
  const displayGoalAmount = privacyMode ? "••••••••" : goalAmount;

  return (
    <div className="space-y-4">
      {/* Selector de tamaño de widget */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setSelectedSize("2x2")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              selectedSize === "2x2"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            2x2 Compacto
          </button>
          <button
            type="button"
            onClick={() => setSelectedSize("4x2")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              selectedSize === "4x2"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            4x2 Resumen
          </button>
          <button
            type="button"
            onClick={() => setSelectedSize("4x4")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              selectedSize === "4x4"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            4x4 Metas
          </button>
        </div>

        <Badge variant={privacyMode ? "destructive" : "secondary"} className="gap-1 text-[10px]">
          {privacyMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {privacyMode ? "Modo Privacidad" : "Modo Normal"}
        </Badge>
      </div>

      {/* Simulador de pantalla de inicio Android */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/30 bg-gradient-to-b from-stone-900 via-neutral-900 to-black p-4 sm:p-6 shadow-inner">
        <div className="mb-3 flex items-center justify-between text-[11px] text-stone-400 font-mono">
          <span>Pantalla de inicio Android</span>
          <span>Widget nativo 100% interactivo</span>
        </div>

        <div className="mx-auto flex justify-center">
          {/* ======================================================== */}
          {/* WIDGET 1: COMPACTO 2x2 */}
          {/* ======================================================== */}
          {selectedSize === "2x2" && (
            <div
              className="w-full max-w-[240px] aspect-square rounded-[26px] border border-[#23382b] bg-[#121c16]/95 p-4 text-white shadow-2xl flex flex-col justify-between select-none relative transition-transform hover:scale-[1.01]"
              style={{
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Header */}
              <Link to="/inicio" className="flex items-center justify-between gap-1 group">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl leading-none">{plantEmoji}</span>
                  <span className="text-xs font-bold tracking-tight text-white/90">
                    PlantWallet
                  </span>
                </div>
                {showScore && (
                  <span className="text-[10px] font-medium text-emerald-300/80 bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-800/40">
                    {score}/100
                  </span>
                )}
              </Link>

              {/* Centro: Dinero Disponible */}
              <div className="my-auto py-2">
                {showBalance ? (
                  <Link to="/movimientos" className="block group">
                    <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                      Disponible
                    </p>
                    <p className="text-base sm:text-lg font-black tracking-tight text-emerald-400 mt-0.5 truncate">
                      {displayBalance}
                    </p>
                  </Link>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-4xl block leading-none">{plantEmoji}</span>
                    <p className="text-xs font-semibold text-emerald-300 mt-1">Salud: {score}/100</p>
                  </div>
                )}
              </div>

              {/* Botón rápido [+] */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sheet.open("expense");
                  }}
                  title="Registrar movimiento rápidamente"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-90 transition-transform cursor-pointer"
                >
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* WIDGET 2: RESUMEN 4x2 */}
          {/* ======================================================== */}
          {selectedSize === "4x2" && (
            <div
              className="w-full max-w-[420px] rounded-[26px] border border-[#23382b] bg-[#121c16]/95 p-4 text-white shadow-2xl flex flex-col justify-between select-none relative transition-transform hover:scale-[1.01]"
              style={{
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Sección superior dividida en dos columnas */}
              <div className="grid grid-cols-2 gap-3 items-center">
                {/* Columna Izquierda: Planta y Salud */}
                <Link
                  to="/inicio"
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-emerald-950/30 transition-colors"
                >
                  <span className="text-3xl sm:text-4xl leading-none">{plantEmoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white/90 truncate">PlantWallet</p>
                    {showScore && (
                      <div className="mt-0.5">
                        <p className="text-[10px] text-stone-400 leading-tight">Salud financiera</p>
                        <p className="text-xs font-black text-emerald-400">{score}/100</p>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Columna Derecha: Disponible, Ingresos y Gastos */}
                <div className="space-y-0.5 text-right">
                  {showBalance && (
                    <Link to="/movimientos" className="block">
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                        Disponible
                      </p>
                      <p className="text-sm sm:text-base font-black text-emerald-400 truncate">
                        {displayBalance}
                      </p>
                    </Link>
                  )}
                  {showIncome && (
                    <p className="text-[10px] font-medium text-emerald-300/90 truncate">
                      Ingresos: <span className="font-semibold">{displayIncome}</span>
                    </p>
                  )}
                  {showExpenses && (
                    <p className="text-[10px] font-medium text-rose-300/90 truncate">
                      Gastos: <span className="font-semibold">{displayExpense}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de acción inferior */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 pt-2 border-t border-emerald-900/30">
                <button
                  type="button"
                  onClick={() => sheet.open("expense")}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 text-rose-300 py-2 px-3 text-xs font-semibold shadow transition-all active:scale-95 cursor-pointer border border-stone-700/40"
                >
                  <Minus className="h-3.5 w-3.5 text-rose-400 stroke-[2.5]" />
                  + Gasto
                </button>
                <button
                  type="button"
                  onClick={() => sheet.open("income")}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700/90 hover:bg-emerald-600/90 text-white py-2 px-3 text-xs font-semibold shadow transition-all active:scale-95 cursor-pointer border border-emerald-600/40"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  + Ingreso
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* WIDGET 3: METAS 4x4 */}
          {/* ======================================================== */}
          {selectedSize === "4x4" && (
            <div
              className="w-full max-w-[420px] rounded-[26px] border border-[#23382b] bg-[#121c16]/95 p-4 text-white shadow-2xl flex flex-col justify-between select-none relative transition-transform hover:scale-[1.01] space-y-3"
              style={{
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Header con Salud */}
              <div className="flex items-center justify-between">
                <Link to="/inicio" className="flex items-center gap-2.5">
                  <span className="text-3xl leading-none">{plantEmoji}</span>
                  <div>
                    <p className="text-xs font-bold text-white/95">PlantWallet</p>
                    {showScore && (
                      <p className="text-[10px] text-stone-400">
                        Salud financiera:{" "}
                        <span className="font-bold text-emerald-400">{score}/100</span>
                      </p>
                    )}
                  </div>
                </Link>

                <div className="text-right">
                  {showBalance && (
                    <>
                      <p className="text-[10px] text-stone-400 uppercase">Disponible</p>
                      <p className="text-sm font-black text-emerald-400">{displayBalance}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Ahorro del mes */}
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-900/40 px-3 py-2 flex items-center justify-between">
                <span className="text-[11px] text-stone-300 font-medium">Ahorro del mes:</span>
                <span className="text-xs font-bold text-emerald-400">{displaySavings}</span>
              </div>

              {/* Tarjeta de Meta de Ahorro */}
              {showGoals && (
                <Link
                  to="/retos"
                  className="block rounded-2xl bg-black/40 border border-emerald-900/40 p-3 hover:border-emerald-700/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-white truncate">{goalTitle}</span>
                    <span className="text-xs font-extrabold text-emerald-400">{goalPercent}%</span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, goalPercent))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>{displayGoalAmount}</span>
                    <span className="text-emerald-400/90 font-medium">Ver meta →</span>
                  </div>

                  {goalCompleted && (
                    <div className="mt-2 rounded-lg bg-emerald-900/60 border border-emerald-700/60 px-2 py-1 text-center text-[10px] font-semibold text-emerald-200">
                      🌸 ¡Meta completada! Tu planta floreció.
                    </div>
                  )}
                </Link>
              )}

              {/* Acciones de 3 botones */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => sheet.open("expense")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 text-rose-300 py-2 px-1 text-[11px] font-semibold shadow active:scale-95 transition-all cursor-pointer border border-stone-700/40"
                >
                  <Minus className="h-3 w-3 text-rose-400 stroke-[2.5]" />
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => sheet.open("income")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-emerald-700/90 hover:bg-emerald-600/90 text-white py-2 px-1 text-[11px] font-semibold shadow active:scale-95 transition-all cursor-pointer border border-emerald-600/40"
                >
                  <Plus className="h-3 w-3 stroke-[2.5]" />
                  Ingreso
                </button>
                <Link
                  to="/retos"
                  className="flex items-center justify-center gap-1 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 text-stone-200 py-2 px-1 text-[11px] font-semibold shadow active:scale-95 transition-all cursor-pointer border border-stone-700/40"
                >
                  <Target className="h-3 w-3 text-amber-400" />
                  Metas
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
