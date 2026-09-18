import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  deleteLocalBudget,
  deleteLocalCategory,
  deleteLocalTransaction,
  equipLocalItem,
  getLocalBudgets,
  getLocalCategories,
  getLocalChallenges,
  getLocalProfile,
  getLocalTransactions,
  getLocalUserPlantItems,
  recalcLocalChallenges,
  restoreLocalDefaultCategories,
  saveLocalBudget,
  saveLocalCategory,
  saveLocalTransaction,
  startLocalChallenge,
  abandonLocalChallenge,
  unlockLocalItem,
  updateLocalProfile,
} from "./localDb";
import { refreshAndSyncWidgets } from "./widget";

export const DEFAULT_CATEGORIES: Array<Omit<Category, "id" | "user_id">> = [
  {
    name: "Vivienda",
    emoji: "🏠",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Alimentación",
    emoji: "🍔",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Mercado",
    emoji: "🛒",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Transporte",
    emoji: "🚗",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Combustible",
    emoji: "⛽",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Servicios",
    emoji: "💡",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Telefonía",
    emoji: "📱",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Internet",
    emoji: "🌐",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Educación",
    emoji: "🎓",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Salud",
    emoji: "💊",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Deudas",
    emoji: "💳",
    type: "expense",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Mascotas",
    emoji: "🐶",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Ropa",
    emoji: "👕",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Entretenimiento",
    emoji: "🎮",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Restaurantes",
    emoji: "🍽️",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Compras",
    emoji: "🛍️",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Viajes",
    emoji: "✈️",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Suscripciones",
    emoji: "📺",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Regalos",
    emoji: "🎁",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Otros",
    emoji: "📦",
    type: "expense",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Salario",
    emoji: "💼",
    type: "income",
    is_essential: true,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Freelance",
    emoji: "💻",
    type: "income",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Rendimientos",
    emoji: "🏦",
    type: "income",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Inversión",
    emoji: "💰",
    type: "income",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Regalo",
    emoji: "🎁",
    type: "income",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Reembolso",
    emoji: "🧾",
    type: "income",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Venta",
    emoji: "📦",
    type: "income",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
  {
    name: "Otros ingresos",
    emoji: "➕",
    type: "income",
    is_essential: false,
    is_active: true,
    color: null,
    description: null,
  },
];

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => getLocalProfile(),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Profile>) => updateLocalProfile(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => getLocalCategories(),
  });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Category> & { id?: string }) => saveLocalCategory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteLocalCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useRestoreDefaultCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => restoreLocalDefaultCategories(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => getLocalTransactions(),
  });
}

export function useSaveTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Transaction> & { id?: string }) =>
      saveLocalTransaction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["user_plant_items"] });
      refreshAndSyncWidgets().catch(() => {});
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteLocalTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      refreshAndSyncWidgets().catch(() => {});
    },
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => getLocalBudgets(),
  });
}

export function useSaveBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { category_id: string; amount: number; currency: string }) =>
      saveLocalBudget(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      refreshAndSyncWidgets().catch(() => {});
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteLocalBudget(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      refreshAndSyncWidgets().catch(() => {});
    },
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => getLocalChallenges(),
  });
}

export function useStartChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<UserChallenge>) => startLocalChallenge(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      refreshAndSyncWidgets().catch(() => {});
    },
  });
}

export function useAbandonChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => abandonLocalChallenge(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      refreshAndSyncWidgets().catch(() => {});
    },
  });
}

export function usePlantCatalog() {
  return useQuery({
    queryKey: ["plant_items"],
    queryFn: async () => FULL_CATALOG,
  });
}

export function useMyPlantItems() {
  return useQuery({
    queryKey: ["user_plant_items"],
    queryFn: async () => getLocalUserPlantItems(),
  });
}

export function useEquipItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      plantItemId,
      itemIds = [],
    }: {
      id?: string;
      plantItemId?: string;
      itemIds?: string[];
    }) => {
      equipLocalItem(plantItemId || id || "", itemIds);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_plant_items"] }),
  });
}

export function useUnlockItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ plantItemId }: { plantItemId: string }) => {
      unlockLocalItem(plantItemId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_plant_items"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRefreshAll() {
  const qc = useQueryClient();
  return async () => {
    recalcLocalChallenges();
    await qc.invalidateQueries();
  };
}
