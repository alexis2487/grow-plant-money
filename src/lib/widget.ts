import { registerPlugin } from "@capacitor/core";
import type { Budget, Transaction, UserChallenge } from "./types";
import { computeHealth } from "./finance";
import { challengeProgress } from "./challenges";
import { formatMoney, monthRange } from "./format";
import {
  getLocalBudgets,
  getLocalChallenges,
  getLocalProfile,
  getLocalTransactions,
} from "./localDb";

export interface WidgetConfig {
  privacyMode: boolean;
  showBalance: boolean;
  showIncome: boolean;
  showExpenses: boolean;
  showScore: boolean;
  showGoals: boolean;
  selectedGoalId: string | null;
}

export interface WidgetDataPayload {
  score: number;
  plantEmoji: string;
  balance: string;
  income: string;
  expense: string;
  savings: string;
  goalTitle: string;
  goalAmount: string;
  goalPercent: number;
  goalCompleted: boolean;
  privacyMode: boolean;
  showBalance: boolean;
  showIncome: boolean;
  showExpenses: boolean;
  showScore: boolean;
  showGoals: boolean;
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  privacyMode: false,
  showBalance: true,
  showIncome: true,
  showExpenses: true,
  showScore: true,
  showGoals: true,
  selectedGoalId: null,
};

const WIDGET_CONFIG_KEY = "plantwallet_widget_config";

export function loadWidgetConfig(): WidgetConfig {
  if (typeof window === "undefined") return DEFAULT_WIDGET_CONFIG;
  try {
    const raw = localStorage.getItem(WIDGET_CONFIG_KEY);
    if (!raw) return DEFAULT_WIDGET_CONFIG;
    return { ...DEFAULT_WIDGET_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WIDGET_CONFIG;
  }
}

export function saveWidgetConfig(cfg: Partial<WidgetConfig>): WidgetConfig {
  const current = loadWidgetConfig();
  const next: WidgetConfig = { ...current, ...cfg };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(next));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }
  return next;
}

/**
 * Mapeo de salud financiera a emoji de planta:
 * 0-20: Brote / estado crítico (🌱)
 * 21-40: Planta marchita / riesgo (🥀)
 * 41-60: Planta en crecimiento / atención (🌿)
 * 61-80: Planta saludable (🪴)
 * 81-100: Planta floreciendo / excelente (🌸)
 */
export function getWidgetPlantEmoji(score: number): string {
  if (score <= 20) return "🌱";
  if (score <= 40) return "🥀";
  if (score <= 60) return "🌿";
  if (score <= 80) return "🪴";
  return "🌸";
}

export function computeWidgetData(
  txs: Transaction[],
  budgets: Budget[],
  challenges: UserChallenge[],
  config: WidgetConfig,
  currency = "COP",
): WidgetDataPayload {
  const health = computeHealth(txs, budgets, []);
  const score = health.score !== null ? Math.round(health.score) : 20;
  const plantEmoji = getWidgetPlantEmoji(score);

  const debitBalance = health.current.debit.balance;
  const debitIncome = health.current.debit.income;
  const debitExpense = health.current.debit.expense;

  const balanceFormatted = formatMoney(debitBalance, currency);
  const incomeFormatted = `+${formatMoney(debitIncome, currency)}`;
  const expenseFormatted = `-${formatMoney(debitExpense, currency)}`;
  const savingsFormatted = formatMoney(Math.max(0, debitBalance), currency);

  // Determinar la meta a mostrar
  let selectedChallenge: UserChallenge | undefined;
  if (config.selectedGoalId) {
    selectedChallenge = challenges.find((c) => c.id === config.selectedGoalId);
  }
  if (!selectedChallenge) {
    selectedChallenge =
      challenges.find((c) => c.status === "active") ?? challenges[0];
  }

  let goalTitle = "Meta de ahorro";
  let goalAmount = "$0 / $0";
  let goalPercent = 0;
  let goalCompleted = false;

  if (selectedChallenge) {
    goalTitle = selectedChallenge.title;
    const progressFmt = formatMoney(selectedChallenge.progress_amount, currency);
    const targetFmt = formatMoney(selectedChallenge.target_amount, currency);
    goalAmount = `${progressFmt} / ${targetFmt}`;
    goalPercent = challengeProgress(selectedChallenge);
    goalCompleted =
      selectedChallenge.status === "completed" ||
      selectedChallenge.progress_amount >= selectedChallenge.target_amount;
  }

  return {
    score,
    plantEmoji,
    balance: balanceFormatted,
    income: incomeFormatted,
    expense: expenseFormatted,
    savings: savingsFormatted,
    goalTitle,
    goalAmount,
    goalPercent,
    goalCompleted,
    privacyMode: config.privacyMode,
    showBalance: config.showBalance,
    showIncome: config.showIncome,
    showExpenses: config.showExpenses,
    showScore: config.showScore,
    showGoals: config.showGoals,
  };
}

export interface PlantWalletWidgetPluginInterface {
  updateWidgetData(data: WidgetDataPayload): Promise<{ success: boolean }>;
  pinWidget(options: { widgetType: "compact" | "summary" | "goals" }): Promise<{ supported: boolean; requested?: boolean; message?: string }>;
}

const PlantWalletWidget = registerPlugin<PlantWalletWidgetPluginInterface>(
  "PlantWalletWidget",
);

export async function pinNativeWidget(
  widgetType: "compact" | "summary" | "goals",
): Promise<{ supported: boolean; requested?: boolean; message?: string }> {
  try {
    return await PlantWalletWidget.pinWidget({ widgetType });
  } catch {
    return {
      supported: false,
      message: "Para añadir el widget, mantén presionada la pantalla de inicio de tu teléfono, selecciona 'Widgets' y busca 'PlantWallet'.",
    };
  }
}

export async function syncNativeWidgets(payload: WidgetDataPayload): Promise<void> {
  // Notificar al simulador / componentes reactivos dentro de la app web/móvil
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("plantwallet:widget-updated", { detail: payload }),
    );
  }

  // Notificar al widget nativo en Android (mediante Capacitor Plugin)
  try {
    await PlantWalletWidget.updateWidgetData(payload);
  } catch {
    // Si corre en navegador o plugin no listo, continuar sin fallos
  }
}

/**
 * Calcula y envía los datos actualizados a los widgets nativos y al simulador.
 */
export async function refreshAndSyncWidgets(
  customConfig?: Partial<WidgetConfig>,
): Promise<WidgetDataPayload> {
  const config = customConfig ? saveWidgetConfig(customConfig) : loadWidgetConfig();
  const txs = getLocalTransactions();
  const budgets = getLocalBudgets();
  const challenges = getLocalChallenges();
  const profile = getLocalProfile();
  const currency = profile.base_currency || "COP";

  const payload = computeWidgetData(txs, budgets, challenges, config, currency);
  await syncNativeWidgets(payload);
  return payload;
}
