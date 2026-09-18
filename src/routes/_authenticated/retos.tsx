import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Check, Lock, RotateCcw, ShieldCheck, User, Eye, Palette } from "lucide-react";
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
  useUnlockItem,
  useStartChallenge,
} from "@/lib/data";
import { suggestChallenges } from "@/lib/challenges";
import { formatMoney, isoDate, monthRange, parseAmount } from "@/lib/format";
import type { Difficulty, PlantItem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/retos")({
  head: () => ({
    meta: [
      { title: "Retos y Colección — PlantWallet" },
      {
        name: "description",
        content: "Retos financieros del sistema, Growth Points y colección dinámica de tu planta con vista previa en vivo.",
      },
      { property: "og:title", content: "Retos y Colección — PlantWallet" },
      { property: "og:description", content: "Mejora tus hábitos financieros y personaliza tu planta con skins exclusivas." },
    ],
  }),
  component: Retos,
});

const RARITY_INFO = {
  common: { label: "Común", border: "border-border", badgeBg: "bg-secondary text-secondary-foreground" },
  rare: { label: "Raro", border: "border-blue-500/40", badgeBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400" },
  epic: { label: "Épico", border: "border-purple-500/40", badgeBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400" },
  legendary: { label: "Legendario", border: "border-amber-500/50", badgeBg: "bg-amber-500/15 text-amber-500 dark:text-amber-400 font-semibold" },
} as const;

/** Mini-renderizador visual de cada elemento en la tienda de colección */
function ItemVisualPreview({ item }: { item: PlantItem }) {
  if (item.item_type === "background") {
    const bgStyles: Record<string, { gradient: string; decor: React.ReactNode }> = {
      bg_room: {
        gradient: "from-slate-100 via-slate-200 to-slate-300",
        decor: (
          <div className="flex items-center gap-1.5 rounded-md bg-white/75 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow-xs backdrop-blur-xs">
            <span>🪟</span> Habitación con luz de ventana
          </div>
        ),
      },
      bg_garden: {
        gradient: "from-emerald-200 via-teal-200 to-emerald-400",
        decor: (
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-950/25 px-2 py-0.5 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs">
            <span>🌿</span> Jardín Tropical Exuberante
          </div>
        ),
      },
      bg_sunrise: {
        gradient: "from-amber-200 via-pink-200 to-purple-400",
        decor: (
          <div className="flex items-center gap-1.5 rounded-md bg-white/50 px-2 py-0.5 text-[11px] font-medium text-amber-950 shadow-xs backdrop-blur-xs">
            <span>🌅</span> Amanecer Dorado & Rosa
          </div>
        ),
      },
      bg_greenhouse: {
        gradient: "from-sky-200 via-cyan-200 to-blue-400",
        decor: (
          <div className="flex items-center gap-1.5 rounded-md bg-sky-950/25 px-2 py-0.5 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs">
            <span>🏛️</span> Invernadero de Cristal
          </div>
        ),
      },
      bg_zen: {
        gradient: "from-amber-100 via-orange-200 to-amber-300",
        decor: (
          <div className="flex items-center gap-1.5 rounded-md bg-amber-950/25 px-2 py-0.5 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs">
            <span>🧘</span> Jardín Zen Atardecer
          </div>
        ),
      },
      bg_night: {
        gradient: "from-slate-900 via-indigo-950 to-purple-950",
        decor: (
          <div className="flex items-center gap-1.5 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-amber-200 shadow-xs backdrop-blur-xs">
            <span>🌙</span> Noche Cósmica & Estrellas
          </div>
        ),
      },
    };

    const c = bgStyles[item.code] ?? {
      gradient: "from-slate-100 to-slate-200",
      decor: <span>{item.name}</span>,
    };

    return (
      <div className={`relative mb-3 flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${c.gradient} shadow-xs border border-border/40`}>
        {c.decor}
      </div>
    );
  }

  if (item.item_type === "pot") {
    const potIcons: Record<string, { icon: string; label: string; bg: string }> = {
      pot_ceramic: { icon: "🏺", label: "Cerámica Terracota", bg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
      pot_wood: { icon: "🪵", label: "Roble Rústico", bg: "bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30" },
      pot_minimal: { icon: "🥛", label: "Porcelana Blanca", bg: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300/40" },
      pot_metal: { icon: "🏆", label: "Oro Pulido", bg: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/40" },
      pot_crystal: { icon: "💎", label: "Terrario Cristal", bg: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40" },
      pot_cyber: { icon: "⚡", label: "Cyberpunk Neón", bg: "bg-fuchsia-950 text-cyan-300 border-cyan-500/60" },
    };
    const p = potIcons[item.code] ?? { icon: "🏺", label: item.name, bg: "bg-secondary border-border" };
    return (
      <div className={`relative mb-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl border ${p.bg} shadow-xs text-sm font-medium`}>
        <span className="text-xl">{p.icon}</span>
        <span className="text-xs">{p.label}</span>
      </div>
    );
  }

  if (item.item_type === "plant") {
    const plantIcons: Record<string, { icon: string; bg: string }> = {
      plant_classic: { icon: "🌿", bg: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
      plant_cactus: { icon: "🌵", bg: "bg-green-500/15 text-green-600 border-green-500/30" },
      plant_succulent: { icon: "🌸", bg: "bg-pink-500/15 text-pink-500 border-pink-500/30" },
      plant_monstera: { icon: "🌱", bg: "bg-teal-500/15 text-teal-600 border-teal-500/30" },
      plant_bonsai: { icon: "🪴", bg: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
      plant_bamboo: { icon: "🎋", bg: "bg-lime-500/15 text-lime-600 border-lime-500/30" },
      plant_tree: { icon: "🌳", bg: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
      plant_carnivorous: { icon: "🌺", bg: "bg-rose-500/20 text-rose-600 border-rose-500/30" },
    };
    const pl = plantIcons[item.code] ?? { icon: "🌱", bg: "bg-secondary border-border" };
    return (
      <div className={`relative mb-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl border ${pl.bg} shadow-xs text-sm font-medium`}>
        <span className="text-2xl">{pl.icon}</span>
      </div>
    );
  }

  // Effect
  const fxIcons: Record<string, { icon: string; label: string; bg: string }> = {
    fx_none: { icon: "⚪", label: "Sin efecto", bg: "bg-secondary/70 border-border/50 text-muted-foreground" },
    fx_leaves: { icon: "🍃", label: "Hojas flotantes", bg: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
    fx_petals: { icon: "🌸", label: "Pétalos Sakura", bg: "bg-pink-500/15 text-pink-600 border-pink-500/30" },
    fx_fireflies: { icon: "💡", label: "Luciérnagas vivas", bg: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" },
    fx_aura: { icon: "🌀", label: "Aura de prosperidad", bg: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30" },
    fx_particles: { icon: "✨", label: "Polvo de oro", bg: "bg-amber-500/20 text-amber-600 border-amber-500/40" },
  };
  const fx = fxIcons[item.code] ?? { icon: "✨", label: item.name, bg: "bg-secondary border-border" };
  return (
    <div className={`relative mb-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl border ${fx.bg} shadow-xs text-xs font-semibold`}>
      <span className="text-xl">{fx.icon}</span>
      <span>{fx.label}</span>
    </div>
  );
}

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
  const unlock = useUnlockItem();

  const [customOpen, setCustomOpen] = useState(false);
  const [collectionTab, setCollectionTab] = useState<"plant" | "pot" | "background" | "effect">("plant");

  // Estado para la vista previa en vivo en la pestaña Colección
  const [previewCodes, setPreviewCodes] = useState<{
    plant?: string;
    pot?: string;
    background?: string;
    effect?: string;
  } | null>(null);
  const [previewItem, setPreviewItem] = useState<PlantItem | null>(null);

  const currency = profile?.base_currency ?? "COP";
  const userPoints = profile?.growth_points ?? 0;

  const suggestions = useMemo(
    () => suggestChallenges(txs, categories, challenges),
    [txs, categories, challenges],
  );

  const active = challenges.filter((c) => c.status === "active");
  const done = challenges.filter((c) => c.status !== "active");
  const unlockedIds = new Set(mine.map((m) => m.plant_item_id));

  // Códigos equipados actualmente
  const equippedCodes = useMemo(() => {
    const codes: Record<string, string> = {
      plant: "plant_classic",
      pot: "pot_ceramic",
      background: "bg_room",
      effect: "fx_none",
    };
    for (const m of mine.filter((x) => x.equipped)) {
      const item = catalog.find((c) => c.id === m.plant_item_id);
      if (item) {
        codes[item.item_type] = item.code;
      }
    }
    return codes;
  }, [mine, catalog]);

  // Códigos efectivos a mostrar en el preview
  const currentDisplayCodes = useMemo(() => {
    return {
      plant: previewCodes?.plant ?? equippedCodes.plant,
      pot: previewCodes?.pot ?? equippedCodes.pot,
      background: previewCodes?.background ?? equippedCodes.background,
      effect: previewCodes?.effect ?? equippedCodes.effect,
    };
  }, [previewCodes, equippedCodes]);

  const isOwned = (item: PlantItem) => {
    if (item.unlock_points === 0) return true;
    if (unlockedIds.has(item.id)) return true;
    return mine.some((m) => {
      const c = catalog.find((cat) => cat.id === m.plant_item_id);
      return c?.code === item.code;
    });
  };

  const handleSelectPreview = (item: PlantItem) => {
    setPreviewItem(item);
    setPreviewCodes((prev) => ({
      ...(prev ?? equippedCodes),
      [item.item_type]: item.code,
    }));
  };

  const handleResetPreview = () => {
    setPreviewCodes(null);
    setPreviewItem(null);
    toast.info("Vista previa restablecida a tus elementos equipados.");
  };

  const handleEquip = async (item: PlantItem) => {
    const userItem = mine.find((m) => {
      const catItem = catalog.find((c) => c.id === m.plant_item_id);
      return catItem?.code === item.code || m.plant_item_id === item.id;
    });

    const categoryItemIds = catalog
      .filter((c) => c.item_type === item.item_type)
      .map((c) => c.id);

    try {
      await equip.mutateAsync({
        id: userItem?.id,
        plantItemId: item.id,
        itemIds: categoryItemIds,
      });

      setPreviewCodes(null);
      setPreviewItem(null);
      toast.success(`¡${item.name} equipado con éxito! 🌱`);
    } catch (err: any) {
      toast.error(err?.message || "No se pudo equipar el elemento.");
    }
  };

  const handleUnlock = async (item: PlantItem) => {
    if (userPoints < item.unlock_points) {
      toast.error(`Necesitas ${item.unlock_points} Growth Points. Te faltan ${item.unlock_points - userPoints} pts.`);
      return;
    }

    try {
      await unlock.mutateAsync({ plantItemId: item.id });
      toast.success(`¡Desbloqueaste ${item.name}! 🎉 Ya puedes equiparlo.`);
    } catch (err: any) {
      toast.error(err?.message || "No se pudo desbloquear el elemento.");
    }
  };

  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Retos & Colección</h1>
          <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <span>🌱</span>
            <span>{userPoints} Growth Points acumulados</span>
          </p>
        </div>
        <Button className="h-11 shrink-0 rounded-xl" onClick={() => setCustomOpen(true)}>
          Crear reto personal
        </Button>
      </header>

      <Tabs defaultValue="activos">
        <TabsList className="grid h-auto w-full grid-cols-4 rounded-2xl p-1">
          <TabsTrigger value="activos" className="min-h-[40px] rounded-xl text-xs">
            Activos {active.length > 0 && `(${active.length})`}
          </TabsTrigger>
          <TabsTrigger value="sugeridos" className="min-h-[40px] rounded-xl text-xs">
            Sugeridos
          </TabsTrigger>
          <TabsTrigger value="historial" className="min-h-[40px] rounded-xl text-xs">
            Historial
          </TabsTrigger>
          <TabsTrigger value="coleccion" className="min-h-[40px] rounded-xl text-xs font-semibold text-primary">
            ✨ Colección
          </TabsTrigger>
        </TabsList>

        {/* PESTAÑA: ACTIVOS */}
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
              description="Elige uno de los retos oficiales del sistema o crea tu propio reto de autocontrol. Recomendamos máximo 3 a la vez."
            />
          )}
        </TabsContent>

        {/* PESTAÑA: SUGERIDOS (Retos del sistema no modificables) */}
        <TabsContent value="sugeridos" className="mt-4 space-y-3">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3.5 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Retos Oficiales del Sistema (Fijos y no modificables)
            </p>
            <p className="mt-1">
              Estos retos están diseñados por la metodología de salud financiera y son los <strong>únicos que otorgan Growth Points</strong> para desbloquear elementos en la Colección.
            </p>
          </div>

          {suggestions.length ? (
            suggestions.map((s, i) => {
              const isZeroLimit = s.challenge_type === "limit" && s.target_amount <= 1;
              const displayDesc = s.description.replace("[Reto Oficial del Sistema] ", "");
              return (
                <article key={i} className="surface space-y-3.5 p-4 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[11px] font-semibold">
                      🛡️ Reto del Sistema · No modificable
                    </Badge>
                    <Badge variant="secondary" className="h-fit shrink-0 text-[11px]">
                      {s.difficulty === "easy" ? "Fácil" : s.difficulty === "medium" ? "Medio" : "Difícil"}
                    </Badge>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{displayDesc}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/50 p-2.5 text-xs">
                    <span>
                      {isZeroLimit ? (
                        <strong>Meta: Cero gastos ($0)</strong>
                      ) : (
                        <span>
                          Meta: <strong>{formatMoney(s.target_amount, currency)}</strong>
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-primary">
                      🎁 +{s.reward_points} Growth Points
                    </span>
                  </div>

                  <Button
                    className="h-12 w-full rounded-xl"
                    disabled={active.length >= 3 || start.isPending}
                    onClick={async () => {
                      await start.mutateAsync({ ...s, currency });
                      toast.success("¡Reto oficial del sistema activado! 🌱 A por esos puntos.");
                    }}
                  >
                    {active.length >= 3 ? "Máximo 3 retos activos" : "Aceptar reto oficial"}
                  </Button>
                </article>
              );
            })
          ) : (
            <EmptyState
              emoji="🌱"
              title="Cargando retos sugeridos..."
              description="Muy pronto podrás elegir entre varios retos oficiales."
            />
          )}
        </TabsContent>

        {/* PESTAÑA: HISTORIAL */}
        <TabsContent value="historial" className="mt-4 space-y-3">
          {done.length ? (
            done.map((c) => <ChallengeCard key={c.id} challenge={c} />)
          ) : (
            <EmptyState emoji="🏆" title="Aquí verás tus retos completados o finalizados" />
          )}
        </TabsContent>

        {/* PESTAÑA: COLECCIÓN (Con Vista Previa Dinámica e Interactiva) */}
        <TabsContent value="coleccion" className="mt-4 space-y-5">
          {/* CONTENEDOR DE VISTA PREVIA EN VIVO */}
          <div className="surface relative flex flex-col items-center overflow-hidden p-5 shadow-sm">
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vista Previa Interactiva
              </span>
              <span className="text-xs font-medium text-primary">
                🌱 Saldo: {userPoints} pts
              </span>
            </div>

            <div className="my-2">
              <FinancialPlant
                score={95}
                size={180}
                plantStyle={currentDisplayCodes.plant}
                potStyle={currentDisplayCodes.pot}
                background={currentDisplayCodes.background}
                backgroundStyle={currentDisplayCodes.background}
                effect={currentDisplayCodes.effect}
              />
            </div>

            {/* RESUMEN DE ELEMENTOS ACTIVOS / EN VISTA PREVIA */}
            <div className="mt-2 mb-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium border transition-colors ${
                  previewItem?.item_type === "plant"
                    ? "border-primary bg-primary/15 text-primary font-semibold ring-1 ring-primary/40"
                    : "border-border/60 bg-muted/40 text-muted-foreground"
                }`}
              >
                🌿 {catalog.find((c) => c.code === currentDisplayCodes.plant)?.name ?? "Planta"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium border transition-colors ${
                  previewItem?.item_type === "pot"
                    ? "border-primary bg-primary/15 text-primary font-semibold ring-1 ring-primary/40"
                    : "border-border/60 bg-muted/40 text-muted-foreground"
                }`}
              >
                🏺 {catalog.find((c) => c.code === currentDisplayCodes.pot)?.name ?? "Maceta"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium border transition-colors ${
                  previewItem?.item_type === "background"
                    ? "border-primary bg-primary/15 text-primary font-semibold ring-1 ring-primary/40"
                    : "border-border/60 bg-muted/40 text-muted-foreground"
                }`}
              >
                🖼️ {catalog.find((c) => c.code === currentDisplayCodes.background)?.name ?? "Fondo"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium border transition-colors ${
                  previewItem?.item_type === "effect"
                    ? "border-primary bg-primary/15 text-primary font-semibold ring-1 ring-primary/40"
                    : "border-border/60 bg-muted/40 text-muted-foreground"
                }`}
              >
                ✨ {catalog.find((c) => c.code === currentDisplayCodes.effect)?.name ?? "Efecto"}
              </span>
            </div>

            {/* BARRA DE ACCIONES DE LA VISTA PREVIA */}
            {previewItem ? (
              <div className="mt-2 w-full rounded-2xl border border-primary/30 bg-primary/10 p-3.5 text-center sm:text-left">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span>Previsualizando: {previewItem.name}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {previewItem.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl text-xs"
                      onClick={handleResetPreview}
                    >
                      <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restablecer
                    </Button>

                    {isOwned(previewItem) ? (
                      <Button
                        size="sm"
                        className="h-9 rounded-xl text-xs"
                        disabled={equippedCodes[previewItem.item_type] === previewItem.code}
                        onClick={() => handleEquip(previewItem)}
                      >
                        {equippedCodes[previewItem.item_type] === previewItem.code ? (
                          <>
                            <Check className="mr-1 h-3.5 w-3.5" /> Equipado
                          </>
                        ) : (
                          "Equipar ahora"
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                        disabled={userPoints < previewItem.unlock_points}
                        onClick={() => handleUnlock(previewItem)}
                      >
                        {userPoints >= previewItem.unlock_points ? (
                          `Desbloquear (${previewItem.unlock_points} pts)`
                        ) : (
                          `Faltan ${previewItem.unlock_points - userPoints} pts`
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Toca cualquier planta, maceta, fondo o efecto abajo para ver cómo lucirá en vivo antes de equiparlo.
              </p>
            )}
          </div>

          {/* SUB-TABS POR TIPO DE ELEMENTO */}
          <Tabs
            value={collectionTab}
            onValueChange={(v) => setCollectionTab(v as typeof collectionTab)}
            className="w-full"
          >
            <TabsList className="grid h-11 w-full grid-cols-4 rounded-xl bg-secondary/70 p-1">
              <TabsTrigger value="plant" className="rounded-lg text-xs font-medium">
                🌿 Plantas
              </TabsTrigger>
              <TabsTrigger value="pot" className="rounded-lg text-xs font-medium">
                🏺 Macetas
              </TabsTrigger>
              <TabsTrigger value="background" className="rounded-lg text-xs font-medium">
                🖼️ Fondos
              </TabsTrigger>
              <TabsTrigger value="effect" className="rounded-lg text-xs font-medium">
                ✨ Efectos
              </TabsTrigger>
            </TabsList>

            {(["plant", "pot", "background", "effect"] as const).map((group) => (
              <TabsContent key={group} value={group} className="mt-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {catalog
                    .filter((c) => c.item_type === group)
                    .map((item) => {
                      const owned = isOwned(item);
                      const isEquipped = equippedCodes[item.item_type] === item.code;
                      const isPreviewing = currentDisplayCodes[item.item_type] === item.code;
                      const rarity = RARITY_INFO[item.rarity as keyof typeof RARITY_INFO] ?? RARITY_INFO.common;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectPreview(item)}
                          className={`relative cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-md ${
                            isPreviewing
                              ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/50"
                              : isEquipped
                                ? "border-success/50 bg-success/5"
                                : owned
                                  ? `${rarity.border} bg-card`
                                  : "border-dashed border-border bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {/* Fila superior: Rareza y Puntos */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${rarity.badgeBg}`}
                            >
                              {rarity.label}
                            </span>
                            {item.unlock_points > 0 ? (
                              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                                🔒 {item.unlock_points} pts
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-success">
                                Inicial gratuito
                              </span>
                            )}
                          </div>

                          {/* Miniatura visual del elemento */}
                          <div className="mt-3">
                            <ItemVisualPreview item={item} />
                          </div>

                          {/* Título y Descripción */}
                          <div className="mt-1">
                            <h3 className="font-semibold text-foreground leading-snug">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {/* Fila inferior: Estado y Botón rápido */}
                          <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                            <div>
                              {isEquipped ? (
                                <span className="flex items-center gap-1 font-semibold text-success">
                                  <Check className="h-3.5 w-3.5" /> Equipado
                                </span>
                              ) : isPreviewing ? (
                                <span className="flex items-center gap-1 font-medium text-primary">
                                  <Sparkles className="h-3.5 w-3.5" /> En vista previa
                                </span>
                              ) : owned ? (
                                <span className="text-muted-foreground">Desbloqueado</span>
                              ) : (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Lock className="h-3 w-3" /> Bloqueado
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant={isPreviewing ? "default" : "outline"}
                                className="h-8 rounded-lg text-xs px-2.5"
                                onClick={() => handleSelectPreview(item)}
                              >
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                {isPreviewing ? "Viendo" : "Ver"}
                              </Button>

                              {owned ? (
                                isEquipped ? (
                                  <Badge variant="secondary" className="text-[11px]">
                                    Activo
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-lg text-xs"
                                    onClick={() => handleEquip(item)}
                                  >
                                    Equipar
                                  </Button>
                                )
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-8 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90"
                                  disabled={userPoints < item.unlock_points}
                                  onClick={() => handleUnlock(item)}
                                >
                                  {userPoints >= item.unlock_points
                                    ? `Desbloquear (${item.unlock_points} pts)`
                                    : `Faltan ${item.unlock_points - userPoints} pts`}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      <CustomChallenge open={customOpen} onOpenChange={setCustomOpen} />
    </div>
  );
}

/** Modal para crear retos personales propios (Autocontrol · 0 pts de tienda) */
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
          <DrawerTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Crear mi reto personal
          </DrawerTitle>
        </DrawerHeader>
        <div className="safe-bottom space-y-4 px-4 pb-6">
          <div className="rounded-xl border border-border bg-secondary/50 p-3 text-xs text-muted-foreground leading-relaxed">
            💡 <strong>Reto de autocontrol personal:</strong> Te permite fijar tus propios límites de gasto mensual. Estos retos <strong>no generan Growth Points</strong> para la tienda, ya que los puntos están reservados para los Retos Oficiales del Sistema.
          </div>

          <div>
            <Label htmlFor="ct">Nombre de tu reto</Label>
            <Input
              id="ct"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Límite personal en cafeterías"
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
              placeholder="0"
              className="mt-1 h-12"
            />
            <p className="mt-1 text-sm text-muted-foreground">{formatMoney(target, currency)}</p>
          </div>

          <div>
            <Label>Dificultad estimada</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger className="mt-1 !h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil (Reto personal · 0 pts)</SelectItem>
                <SelectItem value="medium">Medio (Reto personal · 0 pts)</SelectItem>
                <SelectItem value="hard">Difícil (Reto personal · 0 pts)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {aggressive && (
            <p className="rounded-xl bg-warning/15 p-3 text-sm text-warning-foreground">
              Este objetivo es bastante exigente comparado con tu historial reciente (
              {formatMoney(recentAvg, currency)} el mes pasado).
            </p>
          )}

          <Button
            className="h-13 w-full rounded-2xl py-3.5 font-semibold"
            disabled={start.isPending}
            onClick={async () => {
              if (!title.trim()) return toast.error("Escribe un nombre para tu reto.");
              if (!categoryId) return toast.error("Elige una categoría.");
              if (target <= 0) return toast.error("Define un límite mayor que cero.");
              const cur = monthRange(0);
              await start.mutateAsync({
                title: title.trim(),
                description: "Reto personal de autocontrol creado por ti.",
                challenge_type: "limit",
                difficulty,
                category_id: categoryId,
                target_amount: target,
                baseline_amount: recentAvg || null,
                currency,
                start_date: isoDate(new Date()),
                end_date: cur.end,
                reward_points: 0, // Retos de usuario no farmean puntos de tienda
              });
              toast.success("Reto personal activado 🎯");
              setTitle("");
              setLimit("");
              onOpenChange(false);
            }}
          >
            Crear reto personal
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
