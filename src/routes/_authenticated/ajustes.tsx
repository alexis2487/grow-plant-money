import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBudgets,
  useCategories,
  useProfile,
  useRestoreDefaultCategories,
  useSaveCategory,
  useTransactions,
  useUpdateProfile,
} from "@/lib/data";
import { useAuth } from "@/lib/auth";
import {
  exportLocalBackupJson,
  importLocalBackupJson,
  verifyLocalPin,
} from "@/lib/localDb";
import { CURRENCIES, formatMoney, parseAmount, paymentLabel } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes — PlantWallet" },
      {
        name: "description",
        content: "Configura tu perfil, moneda, tema, categorías, presupuestos y seguridad.",
      },
      { property: "og:title", content: "Ajustes — PlantWallet" },
      { property: "og:description", content: "Personaliza PlantWallet a tu medida." },
    ],
  }),
  component: Ajustes,
});

const EMOJIS = ["🍔", "🚌", "🏠", "💡", "🎬", "🛍️", "💊", "📚", "🎁", "✈️", "🐶", "💼", "💰", "🌱"];

function Ajustes() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-sm text-muted-foreground">Personaliza PlantWallet a tu medida.</p>
      </header>

      <section className="surface space-y-4 p-4">
        <h2 className="text-base font-semibold">Perfil</h2>
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            defaultValue={profile?.name ?? ""}
            className="mt-1 h-12"
            maxLength={60}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== profile?.name) {
                updateProfile.mutate({ name: v });
                toast.success("Nombre actualizado");
              }
            }}
          />
        </div>
        <div>
          <Label>Moneda principal</Label>
          <Select
            value={profile?.base_currency ?? "COP"}
            onValueChange={(v) => {
              updateProfile.mutate({ base_currency: v });
              toast.success("Moneda actualizada");
            }}
          >
            <SelectTrigger className="mt-1 !h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Apariencia</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(
              [
                ["light", "Claro"],
                ["dark", "Oscuro"],
                ["system", "Sistema"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => updateProfile.mutate({ theme: value })}
                className={`min-h-[48px] rounded-xl border text-sm font-medium transition-colors ${
                  (profile?.theme ?? "system") === value
                    ? "border-primary bg-accent"
                    : "border-border bg-card"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label htmlFor="notif">Alertas y recordatorios</Label>
            <p className="text-xs text-muted-foreground">
              Avisos de presupuesto, retos y balance negativo.
            </p>
          </div>
          <Switch
            id="notif"
            checked={profile?.notifications_enabled ?? true}
            onCheckedChange={(v) => updateProfile.mutate({ notifications_enabled: v })}
          />
        </div>
      </section>


      <CategoriesSection emojis={EMOJIS} />
      <BudgetsSection />
      <SecuritySection />
      <DataSection />

      <p className="px-1 text-center text-xs text-muted-foreground">
        PlantWallet v1.0 · Información orientativa, no constituye asesoría financiera.
      </p>
    </div>
  );
}

function CategoriesSection({ emojis }: { emojis: string[] }) {
  const { data: categories = [] } = useCategories();
  const save = useSaveCategory();
  const restore = useRestoreDefaultCategories();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌱");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [essential, setEssential] = useState(false);

  return (
    <section className="surface p-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="cat" className="border-0">
          <AccordionTrigger className="py-0 text-base font-semibold hover:no-underline">
            Categorías ({categories.filter((c) => c.is_active).length})
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No tienes categorías registradas en tu cuenta.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled={restore.isPending}
                  onClick={async () => {
                    await restore.mutateAsync();
                    toast.success("Categorías por defecto restauradas");
                  }}
                >
                  Restaurar categorías iniciales
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden>{c.emoji}</span>
                    <span className="truncate text-sm font-medium">{c.name}</span>
                    {c.is_essential && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        Esencial
                      </Badge>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {c.type === "income" ? "Ingreso" : "Gasto"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`${c.is_active ? "Archivar" : "Restaurar"} ${c.name}`}
                      onClick={() => {
                        save.mutate({ id: c.id, is_active: !c.is_active });
                        toast.success(c.is_active ? "Categoría archivada" : "Categoría restaurada");
                      }}
                    >
                      <Trash2 className={`h-4 w-4 ${c.is_active ? "" : "opacity-40"}`} aria-hidden />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
            )}

            <div className="mt-4 space-y-3 rounded-xl bg-muted/50 p-3">
              <p className="text-sm font-medium">Nueva categoría</p>
              <div className="flex flex-wrap gap-1.5">
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    aria-label={`Elegir ${e}`}
                    className={`h-10 w-10 rounded-xl border text-lg ${
                      emoji === e ? "border-primary bg-accent" : "border-border bg-card"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="h-12"
                maxLength={40}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={type} onValueChange={(v) => setType(v as "expense" | "income")}>
                  <SelectTrigger className="!h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Gasto</SelectItem>
                    <SelectItem value="income">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex min-h-[48px] items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 text-sm">
                  Esencial
                  <Switch checked={essential} onCheckedChange={setEssential} />
                </label>
              </div>
              <Button
                className="h-12 w-full rounded-xl"
                onClick={async () => {
                  if (!name.trim()) return toast.error("Escribe un nombre.");
                  await save.mutateAsync({
                    name: name.trim(),
                    emoji,
                    type,
                    is_essential: essential,
                    is_active: true,
                    color: "#3f9d74",
                  });
                  setName("");
                  toast.success("Categoría creada");
                }}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden /> Crear categoría
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function BudgetsSection() {
  const { data: budgets = [] } = useBudgets();

  return (
    <section className="surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Target className="h-4 w-4 text-primary" aria-hidden /> Metas mensuales ({budgets.length})
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Las metas de gasto ahora se gestionan y visualizan en tiempo real directamente desde tu pantalla de Inicio.
          </p>
        </div>
        <Button asChild variant="secondary" className="h-10 shrink-0 rounded-xl">
          <Link to="/inicio">Ir a Metas en Inicio</Link>
        </Button>
      </div>
    </section>
  );
}

function SecuritySection() {
  const navigate = useNavigate();
  const { lock, resetMasterPin, securityQuestion } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <section className="surface p-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="sec" className="border-0">
          <AccordionTrigger className="py-0 text-base font-semibold hover:no-underline">
            Seguridad y Clave
          </AccordionTrigger>
          <AccordionContent className="space-y-3.5 pt-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <span>Tu pregunta de recuperación configurada: </span>
              <strong className="text-foreground">¿{securityQuestion || "Nombre de tu primera mascota"}?</strong>
            </div>

            <div>
              <Label htmlFor="cp">Clave o PIN actual</Label>
              <Input
                id="cp"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Ingresa tu clave actual"
                className="mt-1 h-12"
              />
            </div>
            <div>
              <Label htmlFor="np">Nueva clave o PIN</Label>
              <Input
                id="np"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                className="mt-1 h-12"
              />
            </div>
            <Button
              variant="secondary"
              className="h-12 w-full rounded-xl font-medium"
              disabled={busy}
              onClick={async () => {
                if (!current.trim()) return toast.error("Ingresa tu clave actual.");
                if (next.length < 4) return toast.error("La nueva clave debe tener al menos 4 caracteres.");
                setBusy(true);
                const valid = await verifyLocalPin(current);
                if (!valid) {
                  setBusy(false);
                  return toast.error("La clave actual es incorrecta.");
                }
                await resetMasterPin(next);
                setBusy(false);
                setCurrent("");
                setNext("");
                toast.success("¡Clave de acceso actualizada!");
              }}
            >
              Cambiar clave de acceso
            </Button>

            <Button
              variant="destructive"
              className="h-12 w-full rounded-xl font-medium"
              onClick={() => {
                lock();
                navigate({ to: "/auth", replace: true });
                toast.info("Aplicación bloqueada.");
              }}
            >
              Bloquear aplicación ahora
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function DataSection() {
  const { data: txs = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const qc = useQueryClient();

  function exportBackup() {
    const json = exportLocalBackupJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantwallet_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Copia de seguridad descargada 🌱");
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const ok = importLocalBackupJson(text);
      if (ok) {
        await qc.invalidateQueries();
        toast.success("¡Copia de seguridad restaurada con éxito! 🌱");
      } else {
        toast.error("El archivo de respaldo no es válido.");
      }
    };
    reader.readAsText(file);
  }

  function exportCsv() {
    const rows = [
      ["fecha", "tipo", "categoria", "descripcion", "importe", "moneda", "metodo_pago", "notas"],
      ...txs.map((t) => [
        t.transaction_date,
        t.type === "income" ? "Ingreso" : "Gasto",
        categories.find((c) => c.id === t.category_id)?.name ?? "",
        t.description ?? "",
        String(t.amount),
        t.currency,
        paymentLabel(t.payment_method),
        t.notes ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantwallet_movimientos.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Movimientos exportados a CSV");
  }

  return (
    <section className="surface space-y-3.5 p-4">
      <h2 className="text-base font-semibold">Copia de seguridad y datos</h2>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Tus datos son 100% privados y residen en este dispositivo. Puedes exportar un respaldo para guardarlo en Google Drive o transferirlo a otro teléfono.
      </p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Button variant="outline" className="h-12 rounded-xl text-xs font-semibold" onClick={exportBackup}>
          💾 Crear respaldo (JSON)
        </Button>

        <label className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-input bg-background px-4 text-xs font-semibold hover:bg-accent hover:text-accent-foreground">
          📥 Restaurar respaldo (JSON)
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>

      <Button variant="secondary" className="h-12 w-full rounded-xl text-xs font-medium" onClick={exportCsv}>
        📊 Exportar movimientos (CSV)
      </Button>
    </section>
  );
}
