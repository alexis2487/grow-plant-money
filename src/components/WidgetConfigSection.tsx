import { useState } from "react";
import { toast } from "sonner";
import { AppWindow, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  loadWidgetConfig,
  saveWidgetConfig,
  refreshAndSyncWidgets,
  type WidgetConfig,
} from "@/lib/widget";
import { useChallenges } from "@/lib/data";
import { WidgetPreview } from "./WidgetPreview";
import { cn } from "@/lib/utils";

export function WidgetConfigSection() {
  const { data: challenges = [] } = useChallenges();
  const [config, setConfig] = useState<WidgetConfig>(loadWidgetConfig());
  const [syncing, setSyncing] = useState(false);

  const update = async (patch: Partial<WidgetConfig>) => {
    const next = saveWidgetConfig(patch);
    setConfig(next);
    await refreshAndSyncWidgets(next);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await refreshAndSyncWidgets(config);
      toast.success("¡Widgets sincronizados con éxito en tu pantalla de inicio! 🌿");
    } catch {
      toast.error("Error al sincronizar widgets");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="surface p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <AppWindow className="h-4 w-4 text-emerald-500" /> Widgets para Android
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personaliza qué datos se muestran en tus widgets (2x2, 4x2 y 4x4) y previsualízalos en tiempo real.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualSync}
          disabled={syncing}
          className="h-8 gap-1.5 text-xs rounded-xl shrink-0"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
          Sincronizar
        </Button>
      </div>

      {/* Simulador interactivo en tiempo real */}
      <WidgetPreview config={config} onConfigChange={setConfig} />

      {/* Controles de Configuración */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Opciones de visualización y privacidad
        </h3>

        {/* Modo Privacidad */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-900/30">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
              {config.privacyMode ? (
                <EyeOff className="h-4 w-4 text-rose-400" />
              ) : (
                <Eye className="h-4 w-4 text-emerald-400" />
              )}
              Modo Privacidad
            </Label>
            <p className="text-xs text-muted-foreground">
              Oculta tus montos y saldos reemplazándolos con •••••••• para máxima discreción.
            </p>
          </div>
          <Switch
            checked={config.privacyMode}
            onCheckedChange={(v) => {
              update({ privacyMode: v });
              toast.success(v ? "Modo privacidad activado en widgets" : "Modo privacidad desactivado");
            }}
          />
        </div>

        {/* Interruptores individuales */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {/* Saldo disponible */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border bg-card">
            <div>
              <Label className="text-xs font-semibold">Saldo disponible</Label>
              <p className="text-[11px] text-muted-foreground">Mostrar dinero disponible</p>
            </div>
            <Switch
              checked={config.showBalance}
              onCheckedChange={(v) => update({ showBalance: v })}
            />
          </div>

          {/* Puntaje de salud */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border bg-card">
            <div>
              <Label className="text-xs font-semibold">Puntaje de salud</Label>
              <p className="text-[11px] text-muted-foreground">Calificación 0-100</p>
            </div>
            <Switch
              checked={config.showScore}
              onCheckedChange={(v) => update({ showScore: v })}
            />
          </div>

          {/* Ingresos */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border bg-card">
            <div>
              <Label className="text-xs font-semibold">Ingresos del período</Label>
              <p className="text-[11px] text-muted-foreground">En widgets 4x2</p>
            </div>
            <Switch
              checked={config.showIncome}
              onCheckedChange={(v) => update({ showIncome: v })}
            />
          </div>

          {/* Gastos */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border bg-card">
            <div>
              <Label className="text-xs font-semibold">Gastos del período</Label>
              <p className="text-[11px] text-muted-foreground">En widgets 4x2</p>
            </div>
            <Switch
              checked={config.showExpenses}
              onCheckedChange={(v) => update({ showExpenses: v })}
            />
          </div>

          {/* Metas de ahorro */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border bg-card sm:col-span-2">
            <div>
              <Label className="text-xs font-semibold">Meta de ahorro</Label>
              <p className="text-[11px] text-muted-foreground">Mostrar tarjeta de progreso en widget 4x4</p>
            </div>
            <Switch
              checked={config.showGoals}
              onCheckedChange={(v) => update({ showGoals: v })}
            />
          </div>
        </div>

        {/* Selector de Meta de Ahorro */}
        {config.showGoals && (
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold">Meta a mostrar en el widget 4x4</Label>
            <Select
              value={config.selectedGoalId ?? "auto"}
              onValueChange={(val) => {
                const selectedGoalId = val === "auto" ? null : val;
                update({ selectedGoalId });
              }}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Seleccionar meta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">🌟 Primera meta activa (automática)</SelectItem>
                {challenges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title} ({c.status === "completed" ? "Completada 🌸" : "En progreso"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Guía paso a paso para Android */}
        <div className="rounded-2xl bg-muted/40 border border-border p-3.5 space-y-2 mt-3">
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            💡 ¿Cómo poner el widget en la pantalla de inicio de tu teléfono?
          </p>
          <div className="text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
            <p>
              <strong className="text-foreground">Opción rápida (automática):</strong> Toca el botón verde{" "}
              <em>"Añadir widget a mi pantalla de inicio"</em> ubicado en el simulador de arriba. Android te mostrará una ventana emergente para anclarlo en un toque.
            </p>
            <p>
              <strong className="text-foreground">Opción manual:</strong>
            </p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Sal de la app y ve a la pantalla principal de tu teléfono Android.</li>
              <li>Mantén presionado tu dedo en cualquier espacio vacío por 1 segundo.</li>
              <li>Toca la opción <strong>Widgets</strong> en el menú inferior.</li>
              <li>Busca <strong>PlantWallet</strong> en la lista de aplicaciones.</li>
              <li>Mantén presionado el widget deseado (2x2, 4x2 o 4x4) y colócalo en tu pantalla.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
