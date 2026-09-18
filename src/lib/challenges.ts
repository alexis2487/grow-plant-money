import type { Category, Difficulty, Transaction, UserChallenge } from "./types";
import { isoDate, monthRange } from "./format";
import { sum } from "./finance";
import { SYSTEM_CHALLENGES } from "./catalog";

export interface ChallengeSuggestion {
  id?: string;
  title: string;
  description: string;
  challenge_type: "reduction" | "limit" | "saving";
  difficulty: Difficulty;
  category_id: string | null;
  target_amount: number;
  baseline_amount: number | null;
  start_date: string;
  end_date: string;
  reward_points: number;
  is_system: boolean;
}

export const REWARD_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 50,
  medium: 100,
  hard: 200,
};

const REDUCTION_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 0.08,
  medium: 0.15,
  hard: 0.25,
};

/** Dificultad adaptativa: sube si el usuario completa, baja si falla. */
export function nextDifficulty(history: UserChallenge[]): Difficulty {
  const finished = history.filter((c) => c.status === "completed" || c.status === "failed").slice(0, 5);
  if (!finished.length) return "easy";
  const completed = finished.filter((c) => c.status === "completed").length;
  const rate = completed / finished.length;
  if (rate >= 0.8) return finished.length >= 4 ? "hard" : "medium";
  if (rate <= 0.34) return "easy";
  return "medium";
}

function monthlyAverage(txs: Transaction[], categoryId: string, months = 3) {
  let total = 0;
  let counted = 0;
  for (let i = 1; i <= months; i++) {
    const r = monthRange(-i);
    const spent = sum(
      txs.filter(
        (t) =>
          t.type === "expense" &&
          t.category_id === categoryId &&
          t.transaction_date >= r.start &&
          t.transaction_date <= r.end,
      ),
    );
    if (spent > 0) {
      total += spent;
      counted++;
    }
  }
  return counted >= 1 ? { average: total / counted, months: counted } : null;
}

/**
 * Encuentra una categoría en la lista de categorías del usuario según pistas de texto.
 */
function findCategoryByHints(hints: string[], categories: Category[]): Category | undefined {
  const lowerHints = hints.map((h) => h.toLowerCase());
  return categories.find((cat) => {
    const name = cat.name.toLowerCase();
    return lowerHints.some((hint) => name.includes(hint) || hint.includes(name));
  });
}

export function suggestChallenges(
  txs: Transaction[],
  categories: Category[],
  history: UserChallenge[],
): ChallengeSuggestion[] {
  const difficulty = nextDifficulty(history);
  const cur = monthRange(0);
  const end = cur.end;
  const start = isoDate(new Date());

  const activeTitles = new Set(
    history.filter((c) => c.status === "active").map((c) => c.title.toLowerCase()),
  );
  const activeCatIds = new Set(
    history.filter((c) => c.status === "active" && c.category_id).map((c) => c.category_id),
  );

  const suggestions: ChallengeSuggestion[] = [];

  // 1. Incorporar los retos oficiales del sistema sugeridos (Fijos y no modificables)
  for (const template of SYSTEM_CHALLENGES) {
    if (activeTitles.has(template.title.toLowerCase())) continue;

    let catId: string | null = null;
    if (template.category_hint.length > 0) {
      const match = findCategoryByHints(template.category_hint, categories);
      if (match) {
        if (activeCatIds.has(match.id)) continue;
        catId = match.id;
      }
    }

    // Calcular fecha de fin según duration_days
    const endDays = new Date();
    endDays.setDate(endDays.getDate() + (template.duration_days || 30));
    const challengeEnd = isoDate(endDays);

    let target = template.target_amount ?? 1;
    let baseline: number | null = null;

    if (template.challenge_type === "saving") {
      // Reto de ahorro: basar en ingresos recientes si existen
      const lastMonth = monthRange(-1);
      const recentIncome = sum(
        txs.filter((t) => t.type === "income" && t.transaction_date >= lastMonth.start && t.transaction_date <= lastMonth.end),
      );
      if (recentIncome > 0) {
        target = Math.round((recentIncome * 0.2) / 1000) * 1000 || 100000;
        baseline = Math.round(recentIncome * 0.1);
      } else {
        target = 100000; // 100.000 COP por defecto
      }
    } else {
      // Postgres check constraint requiere target_amount > 0
      // Para retos de $0 gasto, usamos 1 como límite estricto
      target = target <= 0 ? 1 : target;
      if (catId) {
        const stats = monthlyAverage(txs, catId);
        if (stats) baseline = Math.round(stats.average);
      }
    }

    suggestions.push({
      id: template.id,
      title: template.title,
      description: `[Reto Oficial del Sistema] ${template.description}`,
      challenge_type: template.challenge_type,
      difficulty: template.difficulty,
      category_id: catId,
      target_amount: target,
      baseline_amount: baseline,
      start_date: start,
      end_date: challengeEnd,
      reward_points: template.reward_points,
      is_system: true,
    });
  }

  // 2. Retos dinámicos basados en gasto alto en categorías no esenciales
  const discretionary = categories.filter((c) => c.type === "expense" && !c.is_essential && c.is_active);
  const reduction = REDUCTION_BY_DIFFICULTY[difficulty];

  for (const cat of discretionary) {
    if (activeCatIds.has(cat.id)) continue;
    const stats = monthlyAverage(txs, cat.id);
    if (!stats || stats.average <= 0) continue;
    const dynTarget = Math.max(1000, Math.round((stats.average * (1 - reduction)) / 1000) * 1000);
    suggestions.push({
      title: `${cat.emoji} ${cat.name} consciente`,
      description: `[Reto Oficial del Sistema] Tu promedio reciente en ${cat.name} es de ${Math.round(stats.average).toLocaleString("es-CO")}. Intenta quedarte por debajo de la meta este período.`,
      challenge_type: "reduction",
      difficulty,
      category_id: cat.id,
      target_amount: dynTarget,
      baseline_amount: Math.round(stats.average),
      start_date: start,
      end_date: end,
      reward_points: REWARD_BY_DIFFICULTY[difficulty],
      is_system: true,
    });
  }

  return suggestions.slice(0, 8);
}

export function challengeProgress(c: UserChallenge) {
  const target = Number(c.target_amount);
  const progress = Number(c.progress_amount);

  if (target <= 1) {
    // Reto de cero gastos: si gastó algo (> 0), está al 100% (violado); si no ha gastado nada, 0%
    return progress > 0 ? 100 : 0;
  }

  return Math.max(0, Math.min(100, Math.round((progress / target) * 100)));
}

export function daysLeft(endDate: string) {
  const dateOnly = endDate.includes("T") ? endDate.split("T")[0] : endDate;
  const end = new Date(`${dateOnly}T23:59:59`);
  const diff = end.getTime() - Date.now();
  return Number.isNaN(diff) ? 0 : Math.max(0, Math.ceil(diff / 86400000));
}
