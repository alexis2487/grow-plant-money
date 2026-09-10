import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ChallengeCard } from "@/components/ChallengeCard";
import { EmptyState } from "@/components/EmptyState";
import { FinancialPlant } from "@/components/FinancialPlant";
import {
  useAbandonChallenge,
  useCategories,
  useChallenges,
  useEquipItem,
  useMyPlantItems,
  usePlantCatalog,
  useProfile,
  useTransactions,
} from "@/lib/data";
import { REWARD_BY_DIFFICULTY, suggestChallenges } from "@/lib/challenges";
import { useStartChallenge } from "@/lib/data";
import { formatMoney, isoDate, monthRange, parseAmount } from "@/lib/format";
import type { Difficulty } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/retos")({
  head: () => ({
    meta: [
      { title: "Retos — PlantWallet" },
      {
        name: "description",
        content: "Retos financieros personalizados, Growth Points y la colección de tu planta.",
      },
      { property: "og:title", content: "Retos — PlantWallet" },
      { property: "og:description", content: "Mejora tus hábitos con pequeños retos alcanzables." },
    ],
  }),
  component: Retos,
});

function Retos() {
  const { data: profile } = useProfile();
  const { data: txs = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: challenges = [] } = useChallenges();
  const { data: catalog = [] } = usePlantCatalog();
  const { data: mine = [] } = useMyPlantItems();
  const start = useStartChallenge();
  const abandon = useAbandonChallenge();
  const equip = useEquipItem();
  const [customOpen, setCustomOpen] = useState(false);

  const currency = profile?.base_currency ?? "COP";
  const suggestions = useMemo(
    () => suggestChallenges(txs, categories, challenges),
    [txs, categories, challenges],
  );
  const active = challenges.filter((c) => c.status === "active");
  const done = challenges.filter((c) => c.status !== "active");
  const unlockedIds = new Set(mine.map((m) => m.plant_item_id));
  const equippedCodes = Object.fromEntries(
    mine
      .filter((m) => m.equipped)
      .map((m) => {
        const item = catalog.find((c) => c.id === m.plant_item_id);
        return [item?.item_type ?? "", item?.code ?? ""];
      }),
  );

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Retos</h1>
          <p className="text-sm text-muted-foreground">
            🌱 {profile?.growth_points ?? 0} Growth Points
          </p>
        </div>
        <Button className="h-11 shrink-0 rounded-xl" onClick={() => setCustomOpen(true)}>
          Crear reto
        </Button>
      </header>

      <Tabs defaultValue="activos">
        <TabsList className="grid h-auto w-full grid-cols-4 rounded-2xl p-1">
          <TabsTrigger value="activos" className="min-h-[40px] rounded-xl text-xs">
            Activos
          </TabsTrigger>
          <TabsTrigger value="sugeridos" className="min-h-[40px] rounded-xl text-xs">
            Sugeridos
          </TabsTrigger>
          <TabsTrigger value="historial" className="min-h-[40px] rounded-xl text-xs">
            Historial
          </TabsTrigger>
          <TabsTrigger value="coleccion" className="min-h-[40px] rounded-xl text-xs">
            Colección
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4 space-y-3">
          {active.length ? (
            active.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onAbandon={async (id) => {
                  await abandon.mutateAsync(id);
                  toast.success("Reto abandonado. Puedes empezar otro cuando quieras.");
                }}
              />
            ))
          ) : (
            <EmptyState
              emoji="🌿"
              title="Aún no tienes retos activos"
              description="Elige uno de los sugeridos o crea el tuyo. Recomendamos máximo 3 a la vez."
            />
          )}
        </TabsContent>

        <TabsContent value="sugeridos" className="mt-4 space-y-3">
          {suggestions.length ? (
            suggestions.map((s, i) => (
              <article key={i} className="surface space-y-3 p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                  <Badge variant="secondary" className="h-fit shrink-0">
                    {s.difficulty === "easy" ? "Fácil" : s.difficulty === "medium" ? "Medio" : "Difícil"}
                  </Badge>
                </div>
                <p className="text-sm">
                  Objetivo: <strong>{formatMoney(s.target_amount, currency)}</strong> · 🎁 +
                  {s.reward_points} puntos
                </p>
                <Button
                  className="h-12 w-full rounded-xl"
                  disabled={active.length >= 3 || start.isPending}
                  onClick={async () => {
                    await start.mutateAsync({ ...s, currency });
                    toast.success("Reto activado 🌱");
                  }}
                >
                  {active.length >= 3 ? "Máximo 3 retos activos" : "Empezar este reto"}
                </Button>
              </article>
            ))
          ) : (
            <EmptyState
              emoji="🌱"
              title="Todavía no podemos sugerirte retos"
              description="Con unos movimientos más en categorías no esenciales podremos proponerte retos basados en tu historial real."
            />
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-4 space-y-3">
          {done.length ? (
            done.map((c) => <ChallengeCard key={c.id} challenge={c} />)
          ) : (
            <EmptyState emoji="🏆" title="Aquí verás tus retos terminados" />
          )}
        </TabsContent>

        <TabsContent value="coleccion" className="mt-4 space-y-4">
          <div className="surface flex flex-col items-center p-5">
            <FinancialPlant
              score={92}
              size={160}
              plantStyle={equippedCodes.plant}
              potStyle={equippedCodes.pot}
              effect={equippedCodes.effect}
            />
            <p className="mt-2 text-sm text-muted-foreground">Así se ve tu planta ahora mismo.</p>
          </div>
          {(["plant", "pot", "background", "effect"] as const).map((group) => (
            <section key={group} className="surface p-4">
              <h2 className="text-base font-semibold">
                {{ plant: "Plantas", pot: "Macetas", background: "Fondos", effect: "Efectos" }[group]}
              </h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {catalog
                  .filter((c) => c.item_type === group)
                  .map((item) => {
                    const owned = unlockedIds.has(item.id);
                    const userItem = mine.find((m) => m.plant_item_id === item.id);
                    return (
                      <li key={item.id}>
                        <button
                          disabled={!owned}
                          onClick={async () => {
                            if (!userItem) return;
                            await equip.mutateAsync({
                              id: userItem.id,
                              itemIds: catalog.filter((c) => c.item_type === group).map((c) => c.id),
                            });
                            toast.success(`${item.name} equipado`);
                          }}
                          className={`min-h-[84px] w-full rounded-2xl border p-3 text-left text-sm transition-colors ${
                            userItem?.equipped
                              ? "border-primary bg-accent"
                              : owned
                                ? "border-border bg-card"
                                : "border-dashed border-border bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <span className="block font-medium">{item.name}</span>
                          <span className="block text-xs">
                            {owned
                              ? userItem?.equipped
                                ? "Equipado"
                                : "Toca para equipar"
                              : `🔒 ${item.unlock_points} puntos`}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </TabsContent>
      </Tabs>

      <CustomChallenge open={customOpen} onOpenChange={setCustomOpen} />
    </div>
  );
}

function CustomChallenge({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: categories = [] } = useCategories();
  const { data: profile } = useProfile();
  const { data: txs = [] } = useTransactions();
  const start = useStartChallenge();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [limit, setLimit] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const currency = profile?.base_currency ?? "COP";
  const target = parseAmount(limit);
  const prev = monthRange(-1);
  const recentAvg = txs
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category_id === categoryId &&
        t.transaction_date >= prev.start &&
        t.transaction_date <= prev.end,
    )
    .reduce((a, t) => a + Number(t.amount), 0);
  const aggressive = recentAvg > 0 && target > 0 && target < recentAvg * 0.6;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Crear mi reto</DrawerTitle>
        </DrawerHeader>
        <div className="safe-bottom space-y-4 px-4 pb-6">
          <div>
            <Label htmlFor="ct">Nombre</Label>
            <Input
              id="ct"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Máximo en restaurantes"
              className="mt-1 h-12"
              maxLength={60}
            />
          </div>
          <div>
            <Label>Categoría de gasto</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1 !h-12">
                <SelectValue placeholder="Elige una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((c) => c.type === "expense" && c.is_active)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cl">Límite para este mes</Label>
            <Input
              id="cl"
              inputMode="decimal"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="mt-1 h-12"
            />
            <p className="mt-1 text-sm text-muted-foreground">{formatMoney(target, currency)}</p>
          </div>
          <div>
            <Label>Dificultad</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger className="mt-1 !h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil (+50 puntos)</SelectItem>
                <SelectItem value="medium">Medio (+100 puntos)</SelectItem>
                <SelectItem value="hard">Difícil (+200 puntos)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {aggressive && (
            <p className="rounded-xl bg-warning/15 p-3 text-sm">
              Este objetivo es bastante exigente comparado con tu historial reciente (
              {formatMoney(recentAvg, currency)} el mes pasado). Puedes continuar si lo prefieres.
            </p>
          )}
          <Button
            className="h-13 w-full rounded-2xl py-3.5"
            disabled={start.isPending}
            onClick={async () => {
              if (!title.trim()) return toast.error("Escribe un nombre para tu reto.");
              if (!categoryId) return toast.error("Elige una categoría.");
              if (target <= 0) return toast.error("Define un límite mayor que cero.");
              const cur = monthRange(0);
              await start.mutateAsync({
                title: title.trim(),
                description: "Reto personalizado creado por ti.",
                challenge_type: "limit",
                difficulty,
                category_id: categoryId,
                target_amount: target,
                baseline_amount: recentAvg || null,
                currency,
                start_date: isoDate(new Date()),
                end_date: cur.end,
                reward_points: REWARD_BY_DIFFICULTY[difficulty],
              });
              toast.success("Reto creado 🌱");
              setTitle("");
              setLimit("");
              onOpenChange(false);
            }}
          >
            Crear reto
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
