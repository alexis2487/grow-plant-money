import type { Category, Difficulty, Transaction, UserChallenge } from "./types";
import { isoDate, monthRange } from "./format";
import { sum } from "./finance";

export interface ChallengeSuggestion {
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

export function suggestChallenges(
  txs: Transaction[],
  categories: Category[],
  history: UserChallenge[],
): ChallengeSuggestion[] {
  const difficulty = nextDifficulty(history);
  const reduction = REDUCTION_BY_DIFFICULTY[difficulty];
  const activeCatIds = new Set(
    history.filter((c) => c.status === "active").map((c) => c.category_id),
  );
  const cur = monthRange(0);
  const end = cur.end;
  const start = isoDate(new Date());

  const discretionary = categories.filter((c) => c.type === "expense" && !c.is_essential && c.is_active);
  const suggestions: ChallengeSuggestion[] = [];

  for (const cat of discretionary) {
    if (activeCatIds.has(cat.id)) continue;
    const stats = monthlyAverage(txs, cat.id);
    if (!stats || stats.average <= 0) continue;
    const target = Math.round((stats.average * (1 - reduction)) / 1000) * 1000 || Math.round(stats.average * (1 - reduction));
    suggestions.push({
      title: `${cat.emoji} ${cat.name} consciente`,
      description: `Tu promedio reciente en ${cat.name} es de ${Math.round(stats.average).toLocaleString("es-CO")}. Intenta quedarte por debajo del objetivo este mes.`,
      challenge_type: "reduction",
      difficulty,
      category_id: cat.id,
      target_amount: target,
      baseline_amount: Math.round(stats.average),
      start_date: start,
      end_date: end,
      reward_points: REWARD_BY_DIFFICULTY[difficulty],
    });
  }

  suggestions.sort((a, b) => (b.baseline_amount ?? 0) - (a.baseline_amount ?? 0));

  // Reto de ahorro basado en el balance típico
  const balances = [1, 2, 3].map((i) => {
    const r = monthRange(-i);
    const income = sum(txs.filter((t) => t.type === "income" && t.transaction_date >= r.start && t.transaction_date <= r.end));
    const expense = sum(txs.filter((t) => t.type === "expense" && t.transaction_date >= r.start && t.transaction_date <= r.end));
    return income - expense;
  });
  const avgBalance = balances.reduce((a, b) => a + b, 0) / balances.length;
  if (avgBalance > 0 && !history.some((c) => c.status === "active" && c.challenge_type === "saving")) {
    const target = Math.max(10000, Math.round((avgBalance * 1.1) / 1000) * 1000);
    suggestions.push({
      title: "🌱 Fondo creciente",
      description: "Termina el mes con un balance positivo por encima de tu promedio reciente.",
      challenge_type: "saving",
      difficulty,
      category_id: null,
      target_amount: target,
      baseline_amount: Math.round(avgBalance),
      start_date: cur.start,
      end_date: end,
      reward_points: REWARD_BY_DIFFICULTY[difficulty],
    });
  }

  return suggestions.slice(0, 4);
}

export function challengeProgress(c: UserChallenge) {
  if (c.challenge_type === "saving") {
    return Math.min(100, Math.round((Number(c.progress_amount) / Number(c.target_amount)) * 100));
  }
  // en retos de límite el progreso es consumo del margen
  return Math.min(100, Math.round((Number(c.progress_amount) / Number(c.target_amount)) * 100));
}

export function daysLeft(endDate: string) {
  const end = new Date(`${endDate}T23:59:59`);
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
}
