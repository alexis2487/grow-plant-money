import type {
  Budget,
  Category,
  PlantItem,
  Profile,
  Transaction,
  UserChallenge,
  UserPlantItem,
} from "./types";
import { FULL_CATALOG } from "./catalog";
import { DEFAULT_CATEGORIES } from "./data";
import { isoDate, monthRange } from "./format";

export interface LocalAuthConfig {
  isConfigured: boolean;
  pinHash: string;
  securityQuestion: string;
  securityAnswerHash: string;
  name: string;
}

const STORAGE_KEYS = {
  AUTH: "plantwallet_auth",
  PROFILE: "plantwallet_profile",
  CATEGORIES: "plantwallet_categories",
  TRANSACTIONS: "plantwallet_transactions",
  BUDGETS: "plantwallet_budgets",
  CHALLENGES: "plantwallet_challenges",
  USER_ITEMS: "plantwallet_user_plant_items",
} as const;

export async function hashText(str: string): Promise<string> {
  const normalized = str.trim().toLowerCase();
  const msgUint8 = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error guardando en ${key}:`, err);
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

// ==================== AUTENTICACIÓN LOCAL ====================

export function getLocalAuthConfig(): LocalAuthConfig {
  return getJson<LocalAuthConfig>(STORAGE_KEYS.AUTH, {
    isConfigured: false,
    pinHash: "",
    securityQuestion: "",
    securityAnswerHash: "",
    name: "",
  });
}

export async function setupLocalAuth(
  name: string,
  pin: string,
  securityQuestion: string,
  securityAnswer: string,
): Promise<void> {
  const pinHash = await hashText(pin);
  const securityAnswerHash = await hashText(securityAnswer);

  const authConfig: LocalAuthConfig = {
    isConfigured: true,
    pinHash,
    securityQuestion: securityQuestion.trim(),
    securityAnswerHash,
    name: name.trim(),
  };

  setJson(STORAGE_KEYS.AUTH, authConfig);

  // Inicializar perfil local con el nombre del usuario
  const profile = getLocalProfile();
  updateLocalProfile({
    name: name.trim(),
  });

  // Inicializar catálogo y categorías por defecto si están vacíos
  initLocalDatabase();
}

export async function verifyLocalPin(pin: string): Promise<boolean> {
  const cfg = getLocalAuthConfig();
  if (!cfg.isConfigured || !cfg.pinHash) return true;
  const hash = await hashText(pin);
  return hash === cfg.pinHash;
}

export async function verifyLocalSecurityAnswer(answer: string): Promise<boolean> {
  const cfg = getLocalAuthConfig();
  if (!cfg.isConfigured || !cfg.securityAnswerHash) return false;
  const hash = await hashText(answer);
  return hash === cfg.securityAnswerHash;
}

export async function resetLocalPin(newPin: string): Promise<void> {
  const cfg = getLocalAuthConfig();
  const pinHash = await hashText(newPin);
  setJson(STORAGE_KEYS.AUTH, {
    ...cfg,
    pinHash,
  });
}

// ==================== BASE DE DATOS LOCAL ====================

const DEFAULT_PROFILE: Profile = {
  id: "local_user",
  name: "Jardinero Financiero",
  avatar_url: null,
  base_currency: "COP",
  theme: "system",
  date_format: "DD/MM/YYYY",
  week_start: 1,
  growth_points: 0,
  notifications_enabled: true,
};

export function initLocalDatabase(): void {
  // 1. Categorías iniciales
  const cats = getLocalCategories();
  if (!cats || cats.length === 0) {
    restoreLocalDefaultCategories();
  }

  // 2. Skins iniciales desbloqueadas y equipadas (Monstera clásica, maceta cerámica, habitación, sin efecto)
  const items = getLocalUserPlantItems();
  if (!items || items.length === 0) {
    const starterCodes = ["plant_classic", "pot_ceramic", "bg_room", "fx_none"];
    const initialUserItems: UserPlantItem[] = starterCodes.map((code) => {
      const item = FULL_CATALOG.find((c) => c.code === code);
      return {
        id: uuid(),
        plant_item_id: item?.id ?? code,
        equipped: true,
        unlocked_at: new Date().toISOString(),
      };
    });
    setJson(STORAGE_KEYS.USER_ITEMS, initialUserItems);
  }
}

// Perfil
export function getLocalProfile(): Profile {
  return getJson<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export function updateLocalProfile(patch: Partial<Profile>): Profile {
  const current = getLocalProfile();
  const updated = { ...current, ...patch };
  setJson(STORAGE_KEYS.PROFILE, updated);
  return updated;
}

// Categorías
export function getLocalCategories(): Category[] {
  const cats = getJson<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  return cats.sort((a, b) => a.name.localeCompare(b.name));
}

export function saveLocalCategory(input: Partial<Category> & { id?: string }): Category {
  const current = getLocalCategories();
  if (input.id) {
    const idx = current.findIndex((c) => c.id === input.id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...input } as Category;
      setJson(STORAGE_KEYS.CATEGORIES, current);
      return current[idx];
    }
  }

  const newCat: Category = {
    id: uuid(),
    user_id: "local_user",
    name: input.name?.trim() || "Nueva categoría",
    emoji: input.emoji || "📦",
    type: input.type || "expense",
    color: input.color || null,
    description: input.description || null,
    is_essential: !!input.is_essential,
    is_active: input.is_active !== false,
  };
  current.push(newCat);
  setJson(STORAGE_KEYS.CATEGORIES, current);
  return newCat;
}

export function deleteLocalCategory(id: string): void {
  const current = getLocalCategories().filter((c) => c.id !== id);
  setJson(STORAGE_KEYS.CATEGORIES, current);
}

export function restoreLocalDefaultCategories(): Category[] {
  const defaultCats: Category[] = DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    id: uuid(),
    user_id: "local_user",
  }));
  setJson(STORAGE_KEYS.CATEGORIES, defaultCats);
  return defaultCats;
}

// Transacciones
export function getLocalTransactions(): Transaction[] {
  const txs = getJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  return txs.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
}

export function saveLocalTransaction(input: Partial<Transaction> & { id?: string }): Transaction {
  const current = getLocalTransactions();
  let saved: Transaction;

  if (input.id) {
    const idx = current.findIndex((t) => t.id === input.id);
    if (idx !== -1) {
      saved = { ...current[idx], ...input } as Transaction;
      current[idx] = saved;
    } else {
      saved = {
        id: input.id,
        user_id: "local_user",
        category_id: input.category_id ?? null,
        type: input.type || "expense",
        amount: Number(input.amount) || 0,
        currency: input.currency || "COP",
        description: input.description || null,
        notes: input.notes || null,
        transaction_date: input.transaction_date || isoDate(new Date()),
        payment_method: input.payment_method || "cash",
        is_recurring: !!input.is_recurring,
        recurring_rule: input.recurring_rule || null,
        created_at: new Date().toISOString(),
      };
      current.push(saved);
    }
  } else {
    saved = {
      id: uuid(),
      user_id: "local_user",
      category_id: input.category_id ?? null,
      type: input.type || "expense",
      amount: Number(input.amount) || 0,
      currency: input.currency || "COP",
      description: input.description || null,
      notes: input.notes || null,
      transaction_date: input.transaction_date || isoDate(new Date()),
      payment_method: input.payment_method || "cash",
      is_recurring: !!input.is_recurring,
      recurring_rule: input.recurring_rule || null,
      created_at: new Date().toISOString(),
    };
    current.push(saved);
  }

  setJson(STORAGE_KEYS.TRANSACTIONS, current);
  recalcLocalChallenges();
  return saved;
}

export function deleteLocalTransaction(id: string): void {
  const current = getLocalTransactions().filter((t) => t.id !== id);
  setJson(STORAGE_KEYS.TRANSACTIONS, current);
  recalcLocalChallenges();
}

// Presupuestos / Metas
export function getLocalBudgets(): Budget[] {
  return getJson<Budget[]>(STORAGE_KEYS.BUDGETS, []);
}

export function saveLocalBudget(input: { category_id: string; amount: number; currency: string }): Budget {
  const current = getLocalBudgets();
  const cur = monthRange(0);
  const existingIdx = current.findIndex((b) => b.category_id === input.category_id);

  let budget: Budget;
  if (existingIdx !== -1) {
    budget = {
      ...current[existingIdx],
      amount: Number(input.amount),
      currency: input.currency,
    };
    current[existingIdx] = budget;
  } else {
    budget = {
      id: uuid(),
      user_id: "local_user",
      category_id: input.category_id,
      amount: Number(input.amount),
      currency: input.currency,
      period: "monthly",
      start_date: cur.start,
    };
    current.push(budget);
  }

  setJson(STORAGE_KEYS.BUDGETS, current);
  return budget;
}

export function deleteLocalBudget(id: string): void {
  const current = getLocalBudgets().filter((b) => b.id !== id);
  setJson(STORAGE_KEYS.BUDGETS, current);
}

// Retos
export function getLocalChallenges(): UserChallenge[] {
  const challenges = getJson<UserChallenge[]>(STORAGE_KEYS.CHALLENGES, []);
  return challenges.sort((a, b) => b.start_date.localeCompare(a.start_date));
}

export function startLocalChallenge(input: Partial<UserChallenge>): UserChallenge {
  const current = getLocalChallenges();
  const cur = monthRange(0);

  const newChallenge: UserChallenge = {
    id: uuid(),
    user_id: "local_user",
    title: input.title || "Reto Financiero",
    description: input.description || null,
    challenge_type: input.challenge_type || "limit",
    difficulty: input.difficulty || "medium",
    category_id: input.category_id ?? null,
    target_amount: Number(input.target_amount) || 1,
    baseline_amount: input.baseline_amount ? Number(input.baseline_amount) : null,
    currency: input.currency || "COP",
    start_date: input.start_date || isoDate(new Date()),
    end_date: input.end_date || cur.end,
    status: "active",
    progress_amount: 0,
    reward_points: Number(input.reward_points) || 0,
    completed_at: null,
  };

  current.push(newChallenge);
  setJson(STORAGE_KEYS.CHALLENGES, current);
  recalcLocalChallenges();
  return newChallenge;
}

export function abandonLocalChallenge(id: string): void {
  const current = getLocalChallenges();
  const idx = current.findIndex((c) => c.id === id);
  if (idx !== -1) {
    current[idx].status = "abandoned";
    setJson(STORAGE_KEYS.CHALLENGES, current);
  }
}

/**
 * Lógica local para evaluar retos activos y otorgar Growth Points.
 * Reemplaza completamente el procedimiento SQL recalc_challenges de Supabase.
 */
export function recalcLocalChallenges(): void {
  const challenges = getLocalChallenges();
  const txs = getLocalTransactions();
  const today = isoDate(new Date());
  let pointsAwarded = 0;
  let hasChanges = false;

  for (const c of challenges) {
    if (c.status !== "active") continue;

    const inRange = txs.filter((t) => t.transaction_date >= c.start_date && t.transaction_date <= c.end_date);

    if (c.challenge_type === "saving") {
      // Reto de ahorro: balance en débito
      const debitIn = inRange.filter((t) => t.type === "income" && t.payment_method !== "credit");
      const debitOut = inRange.filter((t) => t.type === "expense" && t.payment_method !== "credit");
      const saved = debitIn.reduce((a, b) => a + Number(b.amount), 0) - debitOut.reduce((a, b) => a + Number(b.amount), 0);
      c.progress_amount = Math.max(0, saved);

      if (saved >= c.target_amount) {
        c.status = "completed";
        c.completed_at = new Date().toISOString();
        pointsAwarded += c.reward_points;
        hasChanges = true;
      } else if (today > c.end_date) {
        c.status = "failed";
        hasChanges = true;
      }
    } else {
      // Retos de gasto / límite
      const catSpent = inRange
        .filter((t) => t.type === "expense" && (!c.category_id || t.category_id === c.category_id))
        .reduce((a, b) => a + Number(b.amount), 0);

      c.progress_amount = catSpent;

      if (catSpent > c.target_amount) {
        c.status = "failed";
        hasChanges = true;
      } else if (today > c.end_date) {
        c.status = "completed";
        c.completed_at = new Date().toISOString();
        pointsAwarded += c.reward_points;
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    setJson(STORAGE_KEYS.CHALLENGES, challenges);
  }

  if (pointsAwarded > 0) {
    const profile = getLocalProfile();
    const newPoints = profile.growth_points + pointsAwarded;
    updateLocalProfile({ growth_points: newPoints });

    // Desbloquear automáticamente ítems que califiquen por puntos acumulados
    const myItems = getLocalUserPlantItems();
    const ownedIds = new Set(myItems.map((m) => m.plant_item_id));

    let itemsChanged = false;
    for (const catItem of FULL_CATALOG) {
      if (catItem.unlock_points <= newPoints && !ownedIds.has(catItem.id)) {
        myItems.push({
          id: uuid(),
          plant_item_id: catItem.id,
          equipped: false,
          unlocked_at: new Date().toISOString(),
        });
        itemsChanged = true;
      }
    }

    if (itemsChanged) {
      setJson(STORAGE_KEYS.USER_ITEMS, myItems);
    }
  }
}

// Ítems de la Planta
export function getLocalUserPlantItems(): UserPlantItem[] {
  return getJson<UserPlantItem[]>(STORAGE_KEYS.USER_ITEMS, []);
}

export function equipLocalItem(itemId: string, categoryItemIds: string[] = []): void {
  const items = getLocalUserPlantItems();

  // 1. Desequipar los de la misma categoría
  if (categoryItemIds.length > 0) {
    for (const item of items) {
      if (categoryItemIds.includes(item.plant_item_id)) {
        item.equipped = false;
      }
    }
  }

  // 2. Equipar el seleccionado
  const target = items.find((i) => i.plant_item_id === itemId || i.id === itemId);
  if (target) {
    target.equipped = true;
  } else {
    items.push({
      id: uuid(),
      plant_item_id: itemId,
      equipped: true,
      unlocked_at: new Date().toISOString(),
    });
  }

  setJson(STORAGE_KEYS.USER_ITEMS, items);
}

export function unlockLocalItem(itemId: string): void {
  const items = getLocalUserPlantItems();
  const existing = items.find((i) => i.plant_item_id === itemId);
  if (!existing) {
    items.push({
      id: uuid(),
      plant_item_id: itemId,
      equipped: false,
      unlocked_at: new Date().toISOString(),
    });
    setJson(STORAGE_KEYS.USER_ITEMS, items);
  }
}

// ==================== RESPALDO Y RESTAURACIÓN ====================

export function exportLocalBackupJson(): string {
  const backup = {
    version: 1,
    exportDate: new Date().toISOString(),
    profile: getLocalProfile(),
    categories: getLocalCategories(),
    transactions: getLocalTransactions(),
    budgets: getLocalBudgets(),
    challenges: getLocalChallenges(),
    userItems: getLocalUserPlantItems(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importLocalBackupJson(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.profile || !Array.isArray(data.categories)) {
      throw new Error("Formato de respaldo inválido");
    }

    if (data.profile) setJson(STORAGE_KEYS.PROFILE, data.profile);
    if (data.categories) setJson(STORAGE_KEYS.CATEGORIES, data.categories);
    if (data.transactions) setJson(STORAGE_KEYS.TRANSACTIONS, data.transactions);
    if (data.budgets) setJson(STORAGE_KEYS.BUDGETS, data.budgets);
    if (data.challenges) setJson(STORAGE_KEYS.CHALLENGES, data.challenges);
    if (data.userItems) setJson(STORAGE_KEYS.USER_ITEMS, data.userItems);

    return true;
  } catch (err) {
    console.error("Error importando respaldo:", err);
    return false;
  }
}
