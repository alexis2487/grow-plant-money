import { FinancialPlant } from "./FinancialPlant";
import { Progress } from "@/components/ui/progress";
import type { HealthResult } from "@/lib/finance";
import { cn } from "@/lib/utils";

const STATE_STYLES: Record<HealthResult["state"], { dot: string; text: string }> = {
  unrated: { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  excellent: { dot: "bg-success", text: "text-success" },
  healthy: { dot: "bg-success", text: "text-success" },
  attention: { dot: "bg-warning", text: "text-warning" },
  risk: { dot: "bg-warning", text: "text-warning" },
  critical: { dot: "bg-danger", text: "text-danger" },
};

export function HealthCard({
  health,
  plantStyle,
  potStyle,
  backgroundStyle,
  effect,
}: {
  health: HealthResult;
  plantStyle?: string;
  potStyle?: string;
  backgroundStyle?: string;
  effect?: string;
}) {
  const isUnrated = health.score === null || health.state === "unrated";
  const s = STATE_STYLES[health.state];

  return (
    <section className="surface overflow-hidden p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", s.dot)} aria-hidden />
            <span className={s.text}>
              {isUnrated ? "Estado: Brote Inicial" : `Salud financiera ${health.label}`}
            </span>
          </div>
          <p className="mt-2 text-4xl font-bold tabular-nums">
            {isUnrated ? "—" : health.score}
            <span className="text-lg font-medium text-muted-foreground">/100</span>
          </p>
          {isUnrated ? (
            <p className="mt-1 text-xs text-muted-foreground font-normal">
              Sin movimientos registrados aún
            </p>
          ) : (
            <Progress value={health.score ?? 0} className="mt-3 h-2" />
          )}
        </div>
        <FinancialPlant
          score={health.score}
          isSprout={isUnrated}
          size={124}
          plantStyle={plantStyle}
          potStyle={potStyle}
          background={backgroundStyle}
          backgroundStyle={backgroundStyle}
          effect={effect}
          className="shrink-0"
        />
      </div>
      <ul className="mt-4 space-y-1.5">
        {health.reasons.slice(0, 3).map((r, i) => (
          <li key={i} className="text-sm leading-snug text-muted-foreground">
            {r}
          </li>
        ))}
      </ul>
    </section>
  );
}
