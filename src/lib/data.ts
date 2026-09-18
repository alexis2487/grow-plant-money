import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type { Budget, Category, PlantItem, Profile, Transaction, UserChallenge, UserPlantItem } from "./types";
import { FULL_CATALOG } from "./catalog";

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()) as Profile,
  });
}

export function useCategories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["categories", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user!.id)
          .order("name"),
      ) as Category[],
  });
}

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user!.id)
          .order("transaction_date", { ascending: false }),
      ) as Transaction[],
  });
}

export function useBudgets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["budgets", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(await supabase.from("budgets").select("*").eq("user_id", user!.id)) as Budget[],
  });
}

export function useChallenges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["challenges", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase
          .from("user_challenges")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
      ) as UserChallenge[],
  });
}

export function usePlantCatalog() {
  return useQuery({
    queryKey: ["plant_items"],
    queryFn: async () => {
      try {
        const { data } = await supabase.from("plant_items").select("*").order("unlock_points");
        const dbItems = (data ?? []) as PlantItem[];
        const dbByCode = new Map(dbItems.map((item) => [item.code, item]));

        return FULL_CATALOG.map((local) => {
          const fromDb = dbByCode.get(local.code);
          if (fromDb) {
            return {
              ...local,
              id: fromDb.id,
            };
          }
          return local;
        });
      } catch {
        return FULL_CATALOG;
      }
    },
  });
}

export function useMyPlantItems() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_plant_items", user?.id],
    enabled: !!user,
    queryFn: async () =>
      must(
        await supabase.from("user_plant_items").select("*").eq("user_id", user!.id),
      ) as UserPlantItem[],
  });
}

export function useRefreshAll() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return async () => {
    await supabase.rpc("recalc_challenges", { p_user: user!.id });
    await qc.invalidateQueries();
  };
}

export function useSaveTransaction() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Transaction> & { id?: string }) => {
      const payload = { ...input, user_id: user!.id };
      if (input.id) {
        must(await supabase.from("transactions").update(payload as never).eq("id", input.id).select());
      } else {
        must(await supabase.from("transactions").insert(payload as never).select());
      }
      await supabase.rpc("recalc_challenges", { p_user: user!.id });
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      must(await supabase.from("transactions").delete().eq("id", id).select());
      await supabase.rpc("recalc_challenges", { p_user: user!.id });
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Category> & { id?: string }) => {
      const payload = { ...input, user_id: user!.id };
      if (input.id) must(await supabase.from("categories").update(payload as never).eq("id", input.id).select());
      else must(await supabase.from("categories").insert(payload as never).select());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export const DEFAULT_CATEGORIES: Array<Omit<Category, "id" | "user_id">> = [
  { name: "Vivienda", emoji: "🏠", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Alimentación", emoji: "🍔", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Mercado", emoji: "🛒", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Transporte", emoji: "🚗", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Combustible", emoji: "⛽", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Servicios", emoji: "💡", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Telefonía", emoji: "📱", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Internet", emoji: "🌐", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Educación", emoji: "🎓", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Salud", emoji: "💊", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Deudas", emoji: "💳", type: "expense", is_essential: true, is_active: true, color: null, description: null },
  { name: "Mascotas", emoji: "🐶", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Ropa", emoji: "👕", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Entretenimiento", emoji: "🎮", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Restaurantes", emoji: "🍽️", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Compras", emoji: "🛍️", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Viajes", emoji: "✈️", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Suscripciones", emoji: "📺", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Regalos", emoji: "🎁", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Otros", emoji: "📦", type: "expense", is_essential: false, is_active: true, color: null, description: null },
  { name: "Salario", emoji: "💼", type: "income", is_essential: true, is_active: true, color: null, description: null },
  { name: "Freelance", emoji: "💻", type: "income", is_essential: false, is_active: true, color: null, description: null },
  { name: "Rendimientos", emoji: "🏦", type: "income", is_essential: false, is_active: true, color: null, description: null },
  { name: "Inversión", emoji: "💰", type: "income", is_essential: false, is_active: true, color: null, description: null },
  { name: "Regalo", emoji: "🎁", type: "income", is_essential: false, is_active: true, color: null, description: null },
  { name: "Reembolso", emoji: "🧾", type: "income", is_essential: false, is_active: true, color: null, description: null },
  { name: "Venta", emoji: "📦", type: "income", is_essential: false, is_active: true, color: null, description: null },
  { name: "Otros ingresos", emoji: "➕", type: "income", is_essential: false, is_active: true, color: null, description: null },
];

export function useRestoreDefaultCategories() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const rows = DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        user_id: user.id,
      }));
      must(await supabase.from("categories").insert(rows as never).select());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useSaveBudget() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { category_id: string; amount: number; currency: string }) => {
      must(
        await supabase
          .from("budgets")
          .upsert(
            { ...input, user_id: user!.id, period: "monthly" },
            { onConflict: "user_id,category_id,period" },
          )
          .select(),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      must(await supabase.from("budgets").delete().eq("id", id).select());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<Profile>) => {
      must(await supabase.from("profiles").update(input).eq("id", user!.id).select());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useStartChallenge() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<UserChallenge>) => {
      must(await supabase.from("user_challenges").insert({ ...input, user_id: user!.id } as never).select());
      await supabase.rpc("recalc_challenges", { p_user: user!.id });
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useAbandonChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      must(await supabase.from("user_challenges").update({ status: "abandoned" }).eq("id", id).select());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
}

export function useEquipItem() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      id,
      plantItemId,
      itemIds,
    }: {
      id?: string;
      plantItemId?: string;
      itemIds: string[];
    }) => {
      if (!user) return;
      if (itemIds.length) {
        await supabase
          .from("user_plant_items")
          .update({ equipped: false })
          .eq("user_id", user.id)
          .in("plant_item_id", itemIds);
      }
      if (id) {
        must(await supabase.from("user_plant_items").update({ equipped: true }).eq("id", id).select());
      } else if (plantItemId) {
        const { data: existing } = await supabase
          .from("user_plant_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("plant_item_id", plantItemId)
          .maybeSingle();

        if (existing) {
          must(await supabase.from("user_plant_items").update({ equipped: true }).eq("id", existing.id).select());
        } else {
          must(
            await supabase
              .from("user_plant_items")
              .insert({
                user_id: user.id,
                plant_item_id: plantItemId,
                equipped: true,
              } as never)
              .select(),
          );
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_plant_items"] }),
  });
}

export function useUnlockItem() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ plantItemId }: { plantItemId: string }) => {
      if (!user) return;
      must(
        await supabase
          .from("user_plant_items")
          .insert({
            user_id: user.id,
            plant_item_id: plantItemId,
            equipped: false,
          } as never)
          .select(),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_plant_items"] }),
  });
}
