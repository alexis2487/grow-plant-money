import { describe, it, expect, beforeEach } from "vitest";

// Mock de localStorage y window para pruebas unitarias en entorno Node
const memoryStorage = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => memoryStorage.get(k) ?? null,
  setItem: (k: string, v: string) => { memoryStorage.set(k, String(v)); },
  removeItem: (k: string) => { memoryStorage.delete(k); },
  clear: () => { memoryStorage.clear(); },
};

Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

import {
  hashText,
  setupLocalAuth,
  verifyLocalPin,
  verifyLocalSecurityAnswer,
  resetLocalPin,
  getLocalAuthConfig,
  getLocalProfile,
  updateLocalProfile,
  initLocalDatabase,
  getLocalCategories,
  saveLocalCategory,
  deleteLocalCategory,
  restoreLocalDefaultCategories,
  getLocalTransactions,
  saveLocalTransaction,
  deleteLocalTransaction,
  getLocalBudgets,
  saveLocalBudget,
  deleteLocalBudget,
  getLocalChallenges,
  startLocalChallenge,
  abandonLocalChallenge,
  recalcLocalChallenges,
  getLocalUserPlantItems,
  equipLocalItem,
  unlockLocalItem,
  exportLocalBackupJson,
  importLocalBackupJson,
} from "../lib/localDb";

describe("localDb.ts - Suite de Pruebas de Base de Datos Local y Offline", () => {
  beforeEach(() => {
    memoryStorage.clear();
  });

  describe("Criptografía y Autenticación", () => {
    it("hashText genera hash SHA-256 determinista en minúsculas", async () => {
      const h1 = await hashText("1234");
      const h2 = await hashText("1234");
      const h3 = await hashText("9999");
      expect(h1).toHaveLength(64);
      expect(h1).toBe(h2);
      expect(h1).not.toBe(h3);
    });

    it("setupLocalAuth guarda configuración y actualiza perfil", async () => {
      await setupLocalAuth("Alexis", "1234", "¿Mascota?", "Bobby");
      const cfg = getLocalAuthConfig();
      expect(cfg.isConfigured).toBe(true);
      expect(cfg.name).toBe("Alexis");
      expect(cfg.securityQuestion).toBe("¿Mascota?");

      const profile = getLocalProfile();
      expect(profile.name).toBe("Alexis");
    });

    it("verifyLocalPin valida el PIN correcto y rechaza los incorrectos", async () => {
      await setupLocalAuth("Alexis", "1234", "¿Mascota?", "Bobby");
      expect(await verifyLocalPin("1234")).toBe(true);
      expect(await verifyLocalPin("0000")).toBe(false);
    });

    it("verifyLocalSecurityAnswer valida sin distinguir mayúsculas/minúsculas", async () => {
      await setupLocalAuth("Alexis", "1234", "¿Mascota?", "Bobby");
      expect(await verifyLocalSecurityAnswer("bobby")).toBe(true);
      expect(await verifyLocalSecurityAnswer("BOBBY")).toBe(true);
      expect(await verifyLocalSecurityAnswer("  Bobby  ")).toBe(true);
      expect(await verifyLocalSecurityAnswer("wrong")).toBe(false);
    });

    it("resetLocalPin cambia el PIN de acceso correctamente", async () => {
      await setupLocalAuth("Alexis", "1234", "¿Mascota?", "Bobby");
      await resetLocalPin("5678");
      expect(await verifyLocalPin("1234")).toBe(false);
      expect(await verifyLocalPin("5678")).toBe(true);
    });
  });

  describe("Perfil de Usuario", () => {
    it("devuelve perfil predeterminado si no hay datos", () => {
      const p = getLocalProfile();
      expect(p.id).toBe("local_user");
      expect(p.base_currency).toBe("COP");
      expect(p.growth_points).toBe(0);
    });

    it("updateLocalProfile realiza cambios incrementales", () => {
      updateLocalProfile({ base_currency: "USD", growth_points: 150 });
      const updated = getLocalProfile();
      expect(updated.base_currency).toBe("USD");
      expect(updated.growth_points).toBe(150);
    });
  });

  describe("Categorías", () => {
    it("restoreLocalDefaultCategories carga las categorías por defecto", () => {
      const cats = restoreLocalDefaultCategories();
      expect(cats.length).toBeGreaterThan(10);
      expect(getLocalCategories().length).toBe(cats.length);
    });

    it("saveLocalCategory crea una nueva categoría y permite editarla", () => {
      const created = saveLocalCategory({
        name: "Videojuegos",
        emoji: "🎮",
        type: "expense",
      });
      expect(created.id).toBeTruthy();
      expect(created.name).toBe("Videojuegos");

      const edited = saveLocalCategory({
        id: created.id,
        name: "Juegos y Consolas",
      });
      expect(edited.name).toBe("Juegos y Consolas");
      expect(getLocalCategories().find((c) => c.id === created.id)?.name).toBe("Juegos y Consolas");
    });

    it("deleteLocalCategory elimina la categoría", () => {
      const c = saveLocalCategory({ name: "Temporal", emoji: "🗑️" });
      expect(getLocalCategories().some((x) => x.id === c.id)).toBe(true);
      deleteLocalCategory(c.id);
      expect(getLocalCategories().some((x) => x.id === c.id)).toBe(false);
    });
  });

  describe("Transacciones", () => {
    it("saveLocalTransaction crea un movimiento y deleteLocalTransaction lo elimina", () => {
      const tx = saveLocalTransaction({
        type: "income",
        amount: 2500000,
        currency: "COP",
        description: "Salario mensual",
        transaction_date: "2026-09-01",
      });
      expect(tx.id).toBeTruthy();
      expect(tx.amount).toBe(2500000);
      expect(getLocalTransactions()).toHaveLength(1);

      deleteLocalTransaction(tx.id);
      expect(getLocalTransactions()).toHaveLength(0);
    });

    it("edita un movimiento existente", () => {
      const tx = saveLocalTransaction({
        type: "expense",
        amount: 50000,
        currency: "COP",
        description: "Cena",
      });
      const updated = saveLocalTransaction({
        id: tx.id,
        amount: 60000,
        description: "Cena con amigos",
      });
      expect(updated.amount).toBe(60000);
      expect(updated.description).toBe("Cena con amigos");
    });
  });

  describe("Presupuestos", () => {
    it("guarda y actualiza presupuestos por categoría", () => {
      const b1 = saveLocalBudget({ category_id: "cat_food", amount: 400000, currency: "COP" });
      expect(b1.amount).toBe(400000);
      expect(getLocalBudgets()).toHaveLength(1);

      // Si se vuelve a guardar la misma categoría, actualiza el monto existente
      const b2 = saveLocalBudget({ category_id: "cat_food", amount: 500000, currency: "COP" });
      expect(b2.amount).toBe(500000);
      expect(getLocalBudgets()).toHaveLength(1);

      deleteLocalBudget(b1.id);
      expect(getLocalBudgets()).toHaveLength(0);
    });
  });

  describe("Retos y Progreso", () => {
    it("startLocalChallenge crea un reto activo y abandonLocalChallenge lo marca abandonado", () => {
      const c = startLocalChallenge({
        title: "Reto de no comer fuera",
        challenge_type: "limit",
        target_amount: 100000,
      });
      expect(c.status).toBe("active");
      abandonLocalChallenge(c.id);
      const found = getLocalChallenges().find((x) => x.id === c.id);
      expect(found?.status).toBe("abandoned");
    });

    it("recalcLocalChallenges completa reto de ahorro cuando se supera la meta", () => {
      const c = startLocalChallenge({
        title: "Ahorro de Septiembre",
        challenge_type: "saving",
        target_amount: 500000,
        reward_points: 100,
        start_date: "2026-09-01",
        end_date: "2026-09-30",
      });

      // Registrar ingreso suficiente
      saveLocalTransaction({
        type: "income",
        amount: 1000000,
        payment_method: "cash",
        transaction_date: "2026-09-10",
      });

      recalcLocalChallenges();
      const updated = getLocalChallenges().find((x) => x.id === c.id);
      expect(updated?.status).toBe("completed");
      expect(getLocalProfile().growth_points).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Ítems y Colección de la Planta", () => {
    it("equipLocalItem equipa un ítem y desequipa los de su categoría", () => {
      initLocalDatabase();
      const catIds = ["pi_pot_ceramic", "pi_pot_tech", "pi_pot_gold"];
      equipLocalItem("pi_pot_tech", catIds);

      const items = getLocalUserPlantItems();
      const tech = items.find((i) => i.plant_item_id === "pi_pot_tech");
      const ceramic = items.find((i) => i.plant_item_id === "pi_pot_ceramic");

      expect(tech?.equipped).toBe(true);
      if (ceramic) {
        expect(ceramic.equipped).toBe(false);
      }
    });

    it("unlockLocalItem desbloquea un ítem nuevo", () => {
      unlockLocalItem("pi_plant_cactus");
      const items = getLocalUserPlantItems();
      expect(items.some((i) => i.plant_item_id === "pi_plant_cactus")).toBe(true);
    });
  });

  describe("Respaldo y Restauración JSON", () => {
    it("exportLocalBackupJson y importLocalBackupJson preservan y restauran todos los datos", () => {
      updateLocalProfile({ name: "Alexis Test", growth_points: 500 });
      saveLocalCategory({ name: "Ahorros Especiales" });
      saveLocalTransaction({ type: "income", amount: 999999, currency: "COP" });

      const jsonStr = exportLocalBackupJson();
      expect(jsonStr).toContain("Alexis Test");
      expect(jsonStr).toContain("Ahorros Especiales");
      expect(jsonStr).toContain("999999");

      // Limpiar memoria
      memoryStorage.clear();
      expect(getLocalProfile().name).not.toBe("Alexis Test");

      // Restaurar
      const ok = importLocalBackupJson(jsonStr);
      expect(ok).toBe(true);
      expect(getLocalProfile().name).toBe("Alexis Test");
      expect(getLocalProfile().growth_points).toBe(500);
      expect(getLocalTransactions().some((t) => t.amount === 999999)).toBe(true);
    });

    it("importLocalBackupJson rechaza JSON corrupto", () => {
      expect(importLocalBackupJson("invalid json")).toBe(false);
      expect(importLocalBackupJson("{}")).toBe(false);
    });
  });
});
