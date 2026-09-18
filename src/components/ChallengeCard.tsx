import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { challengeProgress, daysLeft } from "@/lib/challenges";
import type { UserChallenge } from "@/lib/types";

const DIFF_LABEL = { easy: "Fácil", medium: "Medio", hard: "Difícil" } as const;

export function ChallengeCard({
  challenge,
  onAbandon,
}: {
  challenge: UserChallenge;
  onAbandon?: (id: string) => void;
}) {
  const isZeroLimit = challenge.challenge_type === "limit" && Number(challenge.target_amount) <= 1;
  const isSystem = challenge.reward_points > 0 || challenge.description?.includes("[Reto Oficial del Sistema]");
  const pct = challengeProgress(challenge);
  const saving = challenge.challenge_type === "saving";
  const left = daysLeft(challenge.end_date);
  const spent = Number(challenge.progress_amount);
  const over = isZeroLimit ? spent > 0 : !saving && pct >= 100;

  // Limpiar el prefijo técnico de la descripción si existe
  const displayDescription = challenge.description?.replace("[Reto Oficial del Sistema] ", "");

  return (
    <article className="surface space-y-3.5 p-4 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isSystem ? (
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[11px] font-semibold">
              🛡️ Sistema (No modificable)
            </Badge>
          ) : (
            <Badge variant="outline" className="border-secondary-foreground/20 bg-secondary text-[11px] font-medium">
              🎯 Reto Personal
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0 text-[11px]">
          {DIFF_LABEL[challenge.difficulty]}
        </Badge>
      </div>

      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-snug">{challenge.title}</h3>
        {displayDescription && (
          <p className="mt-1 text-sm text-muted-foreground">{displayDescription}</p>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium tabular-nums">
            {isZeroLimit ? (
              <span>
                {spent > 0 ? (
                  <strong className="text-danger">{formatMoney(spent, challenge.currency)} gastados</strong>
                ) : (
                  <strong className="text-success">$0 gastados</strong>
                )}{" "}
                <span className="text-muted-foreground">/ Meta: $0</span>
              </span>
            ) : (
              <span>
                {formatMoney(Number(challenge.progress_amount), challenge.currency)}{" "}
                <span className="text-muted-foreground">
                  / {formatMoney(Number(challenge.target_amount), challenge.currency)}
                </span>
              </span>
            )}
          </span>
          <span className="tabular-nums text-muted-foreground">{pct}%</span>
        </div>
        <Progress
          value={pct}
          className={`mt-2 h-2 ${over ? "[&>div]:bg-danger" : ""}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {challenge.status === "active" && <span>⏳ {left} días restantes</span>}
        {isSystem ? (
          <span className="font-semibold text-primary">🎁 +{challenge.reward_points} Growth Points</span>
        ) : (
          <span>🌱 0 pts · Meta personal</span>
        )}
        {challenge.status === "completed" && <span className="font-semibold text-success">✅ Completado con éxito</span>}
        {challenge.status === "failed" && <span className="text-danger">❌ Sin completar esta vez</span>}
      </div>

      {!saving && challenge.status === "active" && (
        <p className="text-sm">
          {isZeroLimit ? (
            spent > 0 ? (
              <span className="text-danger">Superaste el objetivo de gasto cero. Podrás reintentarlo el próximo período.</span>
            ) : (
              <span className="text-success font-medium">¡Excelente! Cero gastos registrados hasta ahora en esta categoría.</span>
            )
          ) : over ? (
            <span className="text-danger">Ya superaste el objetivo de este reto; sigue registrando y vuelve a intentarlo el próximo período.</span>
          ) : (
            `Te quedan ${formatMoney(Number(challenge.target_amount) - spent, challenge.currency)} de margen.`
          )}
        </p>
      )}

      {challenge.status === "active" && onAbandon && (
        <div className="pt-1">
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-danger" onClick={() => onAbandon(challenge.id)}>
            Abandonar reto
          </Button>
        </div>
      )}
    </article>
  );
}
