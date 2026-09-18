import { describe, it, expect } from "vitest";
import { nextDifficulty, suggestChallenges, challengeProgress, daysLeft } from "../lib/challenges";
import type { Category, Transaction, UserChallenge } from "../lib/types";

describe("challenges.ts - Suite de Pruebas de Retos", () => {
  describe("nextDifficulty", () => {
    it("devuelve easy si no hay historial", () => {
      expect(nextDifficulty([])).toBe("easy");
    });

    it("sube dificultad a medium o hard si el usuario completa la mayoría", () => {
      const history: UserChallenge[] = [
        { status: "completed" } as UserChallenge,
        { status: "completed" } as UserChallenge,
        { status: "completed" } as UserChallenge,
        { status: "completed" } as UserChallenge,
      ];
      expect(nextDifficulty(history)).toBe("hard");
    });

    it("baja a easy si la tasa de éxito es muy baja", () => {
      const history: UserChallenge[] = [
        { status: "failed" } as UserChallenge,
        { status: "failed" } as UserChallenge,
        { status: "failed" } as UserChallenge,
      ];
      expect(nextDifficulty(history)).toBe("easy");
    });
  });

  describe("challengeProgress", () => {
    it("calcula el porcentaje estándar", () => {
      const c = { target_amount: 100000, progress_amount: 50000 } as UserChallenge;
      expect(challengeProgress(c)).toBe(50);
    });

    it("acota el progreso a máximo 100%", () => {
      const c = { target_amount: 100000, progress_amount: 150000 } as UserChallenge;
      expect(challengeProgress(c)).toBe(100);
    });

    it("acota el progreso a mínimo 0%", () => {
      const c = { target_amount: 100000, progress_amount: -5000 } as UserChallenge;
      expect(challengeProgress(c)).toBe(0);
    });

    it("maneja retos de gasto cero (target_amount <= 1)", () => {
      const clean = { target_amount: 1, progress_amount: 0 } as UserChallenge;
      expect(challengeProgress(clean)).toBe(0);

      const violated = { target_amount: 1, progress_amount: 5000 } as UserChallenge;
      expect(challengeProgress(violated)).toBe(100);
    });
  });

  describe("daysLeft", () => {
    it("calcula días restantes correctamente para fechas futuras", () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const iso = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;
      expect(daysLeft(iso)).toBeGreaterThanOrEqual(4);
    });

    it("devuelve 0 para fechas pasadas", () => {
      expect(daysLeft("2020-01-01")).toBe(0);
    });

    it("soporta formato ISO completo con timestamp T", () => {
      expect(() => daysLeft("2020-01-01T12:00:00.000Z")).not.toThrow();
      expect(daysLeft("2020-01-01T12:00:00.000Z")).toBe(0);
    });
  });

  describe("suggestChallenges", () => {
    const categories: Category[] = [
      {
        id: "c_rest",
        user_id: "u1",
        name: "Restaurantes",
        emoji: "🍽️",
        type: "expense",
        is_essential: false,
        is_active: true,
        color: null,
        description: null,
      },
      {
        id: "c_sal",
        user_id: "u1",
        name: "Salario",
        emoji: "💼",
        type: "income",
        is_essential: true,
        is_active: true,
        color: null,
        description: null,
      },
    ];

    it("genera sugerencias oficiales del sistema y no supera 8", () => {
      const suggestions = suggestChallenges([], categories, []);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(8);
      expect(suggestions[0]).toHaveProperty("title");
      expect(suggestions[0]).toHaveProperty("reward_points");
      expect(suggestions[0]).toHaveProperty("difficulty");
    });

    it("no sugiere retos ya activos", () => {
      const suggestions = suggestChallenges([], categories, []);
      const first = suggestions[0];

      const activeChallenge: UserChallenge = {
        id: "active_1",
        user_id: "u1",
        title: first.title,
        description: first.description,
        challenge_type: first.challenge_type,
        difficulty: first.difficulty,
        category_id: first.category_id,
        target_amount: first.target_amount,
        baseline_amount: first.baseline_amount,
        currency: "COP",
        start_date: "2026-09-01",
        end_date: "2026-09-30",
        status: "active",
        progress_amount: 0,
        reward_points: first.reward_points,
        completed_at: null,
      };

      const newSuggestions = suggestChallenges([], categories, [activeChallenge]);
      expect(newSuggestions.some((s) => s.title.toLowerCase() === first.title.toLowerCase())).toBe(
        false,
      );
    });
  });
});
