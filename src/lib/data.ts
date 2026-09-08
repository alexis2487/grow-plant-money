import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import type { Budget, Category, PlantItem, Profile, Transaction, UserChallenge, UserPlantItem } from "./types";

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
        await supabase.from("categories").select("*").eq("user_id", user!.id).order("name"),
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
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(2000),
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
    queryFn: async () =>
      must(
        await supabase.from("plant_items").select("*").order("unlock_points"),
      ) as PlantItem[],
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
        must(await supabase.from("transactions").update(payload).eq("id", input.id).select());
      } else {
        must(await supabase.from("transactions").insert(payload).select());
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
      if (input.id) must(await supabase.from("categories").update(payload).eq("id", input.id).select());
      else must(await supabase.from("categories").insert(payload).select());
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
      must(await supabase.from("user_challenges").insert({ ...input, user_id: user!.id }).select());
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
    mutationFn: async ({ id, itemIds }: { id: string; itemIds: string[] }) => {
      if (itemIds.length)
        must(
          await supabase
            .from("user_plant_items")
            .update({ equipped: false })
            .eq("user_id", user!.id)
            .in("plant_item_id", itemIds)
            .select(),
        );
      must(await supabase.from("user_plant_items").update({ equipped: true }).eq("id", id).select());
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_plant_items"] }),
  });
}
