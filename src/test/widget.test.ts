/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from "vitest";

// Mock de localStorage y window para pruebas en entorno Node
const memoryStorage = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => memoryStorage.get(k) ?? null,
  setItem: (k: string, v: string) => {
    memoryStorage.set(k, String(v));
  },
  removeItem: (k: string) => {
    memoryStorage.delete(k);
  },
  clear: () => {
    memoryStorage.clear();
  },
};

const listeners = new Map<string, Array<(e: any) => void>>();

const windowMock = {
  localStorage: localStorageMock,
  addEventListener: (event: string, fn: (e: any) => void) => {
    const list = listeners.get(event) || [];
    list.push(fn);
    listeners.set(event, list);
  },
  removeEventListener: (event: string, fn: (e: any) => void) => {
    const list = listeners.get(event) || [];
    const idx = list.indexOf(fn);
    if (idx !== -1) list.splice(idx, 1);
  },
  dispatchEvent: (e: any) => {
    const list = listeners.get(e.type) || [];
    list.forEach((fn) => fn(e));
    return true;
  },
};

Object.defineProperty(globalThis, "window", {
  value: windowMock,
  writable: true,
});

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// CustomEvent mock si no está en el entorno
if (typeof (globalThis as any).CustomEvent === "undefined") {
  class CustomEvent<T = any> {
    type: string;
    detail: T;
    constructor(type: string, params?: { detail: T }) {
      this.type = type;
      this.detail = params?.detail as T;
    }
  }
  (globalThis as any).CustomEvent = CustomEvent;
}

import {
  getWidgetPlantEmoji,
  computeWidgetData,
  loadWidgetConfig,
  saveWidgetConfig,
  syncNativeWidgets,
  DEFAULT_WIDGET_CONFIG,
  type WidgetConfig,
} from "../lib/widget";
import type { Transaction, UserChallenge } from "../lib/types";
import { monthRange } from "../lib/format";

describe("Widgets de Pantalla de Inicio — PlantWallet", () => {
  beforeEach(() => {
    memoryStorage.clear();
    listeners.clear();
  });

  describe("1. Mapeo de estados de la planta por puntaje de salud", () => {
    it("0 - 20: Brote / estado crítico (🌱)", () => {
      expect(getWidgetPlantEmoji(0)).toBe("🌱");
      expect(getWidgetPlantEmoji(10)).toBe("🌱");
      expect(getWidgetPlantEmoji(20)).toBe("🌱");
    });

    it("21 - 40: Planta marchita / riesgo (🥀)", () => {
      expect(getWidgetPlantEmoji(21)).toBe("🥀");
      expect(getWidgetPlantEmoji(30)).toBe("🥀");
      expect(getWidgetPlantEmoji(40)).toBe("🥀");
    });

    it("41 - 60: Planta en crecimiento / atención (🌿)", () => {
      expect(getWidgetPlantEmoji(41)).toBe("🌿");
      expect(getWidgetPlantEmoji(50)).toBe("🌿");
      expect(getWidgetPlantEmoji(60)).toBe("🌿");
    });

    it("61 - 80: Planta saludable (🪴)", () => {
      expect(getWidgetPlantEmoji(61)).toBe("🪴");
      expect(getWidgetPlantEmoji(70)).toBe("🪴");
      expect(getWidgetPlantEmoji(80)).toBe("🪴");
    });

    it("81 - 100: Planta floreciendo / excelente (🌸)", () => {
      expect(getWidgetPlantEmoji(81)).toBe("🌸");
      expect(getWidgetPlantEmoji(90)).toBe("🌸");
      expect(getWidgetPlantEmoji(100)).toBe("🌸");
    });
  });

  describe("2. Configuración y persistencia del widget", () => {
    it("carga valores predeterminados cuando no hay configuración previa", () => {
      const config = loadWidgetConfig();
      expect(config).toEqual(DEFAULT_WIDGET_CONFIG);
      expect(config.privacyMode).toBe(false);
      expect(config.showBalance).toBe(true);
      expect(config.showIncome).toBe(true);
      expect(config.showExpenses).toBe(true);
      expect(config.showScore).toBe(true);
      expect(config.showGoals).toBe(true);
    });

    it("guarda y recupera cambios parciales en la configuración", () => {
      saveWidgetConfig({ privacyMode: true, showExpenses: false });
      const loaded = loadWidgetConfig();
      expect(loaded.privacyMode).toBe(true);
      expect(loaded.showExpenses).toBe(false);
      expect(loaded.showBalance).toBe(true); // Se conserva el valor por defecto
    });
  });

  describe("3. Cálculo de datos para los widgets (Compacto, Resumen y Metas)", () => {
    const cur = monthRange(0);

    const sampleTxs: Transaction[] = [
      {
        id: "tx-1",
        user_id: "local_user",
        category_id: "cat-salario",
        type: "income",
        amount: 3500000,
        currency: "COP",
        description: "Salario mensual",
        notes: null,
        transaction_date: `${cur.start.slice(0, 7)}-05`,
        payment_method: "cash",
        is_recurring: false,
        recurring_rule: null,
        created_at: new Date().toISOString(),
      },
      {
        id: "tx-2",
        user_id: "local_user",
        category_id: "cat-arriendo",
        type: "expense",
        amount: 1200000,
        currency: "COP",
        description: "Arriendo departamento",
        notes: null,
        transaction_date: `${cur.start.slice(0, 7)}-06`,
        payment_method: "cash",
        is_recurring: false,
        recurring_rule: null,
        created_at: new Date().toISOString(),
      },
      {
        id: "tx-3",
        user_id: "local_user",
        category_id: "cat-mercado",
        type: "expense",
        amount: 1060000,
        currency: "COP",
        description: "Mercado quincenal",
        notes: null,
        transaction_date: `${cur.start.slice(0, 7)}-10`,
        payment_method: "cash",
        is_recurring: false,
        recurring_rule: null,
        created_at: new Date().toISOString(),
      },
    ];

    const sampleChallenges: UserChallenge[] = [
      {
        id: "challenge-vacaciones",
        user_id: "local_user",
        title: "🏖️ Vacaciones",
        description: "Ahorro para el viaje a la playa",
        challenge_type: "saving",
        difficulty: "medium",
        category_id: null,
        target_amount: 2500000,
        baseline_amount: 1000000,
        currency: "COP",
        start_date: cur.start,
        end_date: cur.end,
        status: "active",
        progress_amount: 1800000,
        reward_points: 100,
        completed_at: null,
      },
      {
        id: "challenge-completado",
        user_id: "local_user",
        title: " Fondo de emergencia",
        description: "3 meses de gastos esenciales",
        challenge_type: "saving",
        difficulty: "hard",
        category_id: null,
        target_amount: 5000000,
        baseline_amount: null,
        currency: "COP",
        start_date: cur.start,
        end_date: cur.end,
        status: "completed",
        progress_amount: 5000000,
        reward_points: 200,
        completed_at: new Date().toISOString(),
      },
    ];

    it("calcula saldo disponible, ingresos, gastos y ahorro correctamente", () => {
      const config = DEFAULT_WIDGET_CONFIG;
      const data = computeWidgetData(sampleTxs, [], sampleChallenges, config, "COP");

      // Balance = 3.500.000 - (1.200.000 + 1.060.000) = 1.240.000
      expect(data.balance).toContain("1.240.000");
      expect(data.income).toContain("3.500.000");
      expect(data.expense).toContain("2.260.000");
      expect(data.savings).toContain("1.240.000");
      expect(data.score).toBeGreaterThanOrEqual(0);
      expect(data.score).toBeLessThanOrEqual(100);
      expect(data.plantEmoji).toBeTruthy();
    });

    it("selecciona y calcula la meta de ahorro activa con porcentaje de progreso", () => {
      const config = DEFAULT_WIDGET_CONFIG;
      const data = computeWidgetData(sampleTxs, [], sampleChallenges, config, "COP");

      expect(data.goalTitle).toBe("🏖️ Vacaciones");
      expect(data.goalAmount).toContain("1.800.000");
      expect(data.goalAmount).toContain("2.500.000");
      // 1.800.000 / 2.500.000 = 72%
      expect(data.goalPercent).toBe(72);
      expect(data.goalCompleted).toBe(false);
    });

    it("permite seleccionar una meta específica por ID y detecta cuando está completada", () => {
      const config: WidgetConfig = {
        ...DEFAULT_WIDGET_CONFIG,
        selectedGoalId: "challenge-completado",
      };
      const data = computeWidgetData(sampleTxs, [], sampleChallenges, config, "COP");

      expect(data.goalTitle).toBe(" Fondo de emergencia");
      expect(data.goalPercent).toBe(100);
      expect(data.goalCompleted).toBe(true);
    });

    it("aplica los flags de privacidad y visibilidad al payload", () => {
      const config: WidgetConfig = {
        ...DEFAULT_WIDGET_CONFIG,
        privacyMode: true,
        showIncome: false,
        showExpenses: false,
      };
      const data = computeWidgetData(sampleTxs, [], sampleChallenges, config, "COP");

      expect(data.privacyMode).toBe(true);
      expect(data.showIncome).toBe(false);
      expect(data.showExpenses).toBe(false);
      expect(data.showBalance).toBe(true);
    });
  });

  describe("4. Sincronización nativa y eventos en tiempo real", () => {
    it("dispara evento plantwallet:widget-updated en window sin lanzar excepciones", async () => {
      let receivedDetail: any = null;
      const handler = (e: any) => {
        receivedDetail = e.detail;
      };
      windowMock.addEventListener("plantwallet:widget-updated", handler);

      const payload = computeWidgetData([], [], [], DEFAULT_WIDGET_CONFIG, "COP");
      await syncNativeWidgets(payload);

      expect(receivedDetail).not.toBeNull();
      expect(receivedDetail.score).toBe(payload.score);
      expect(receivedDetail.plantEmoji).toBe(payload.plantEmoji);

      windowMock.removeEventListener("plantwallet:widget-updated", handler);
    });
  });
});
