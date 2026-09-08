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
  const pct = challengeProgress(challenge);
  const saving = challenge.challenge_type === "saving";
  const left = daysLeft(challenge.end_date);
  const over = !saving && pct >= 100;

  return (
    <article className="surface space-y-3 p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{challenge.title}</h3>
          {challenge.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{challenge.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0">
          {DIFF_LABEL[challenge.difficulty]}
        </Badge>
      </div>

      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium tabular-nums">
            {formatMoney(Number(challenge.progress_amount), challenge.currency)}{" "}
            <span className="text-muted-foreground">
              / {formatMoney(Number(challenge.target_amount), challenge.currency)}
            </span>
          </span>
          <span className="tabular-nums text-muted-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="mt-2 h-2" />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {challenge.status === "active" && <span>⏳ {left} días restantes</span>}
        <span>🎁 +{challenge.reward_points} Growth Points</span>
        {challenge.status === "completed" && <span className="text-success">✅ Completado</span>}
        {challenge.status === "failed" && <span>Sin completar esta vez</span>}
      </div>

      {!saving && challenge.status === "active" && (
        <p className="text-sm">
          {over
            ? "Ya superaste el objetivo de este reto; sigue registrando y vuelve a intentarlo el próximo período."
            : `Te quedan ${formatMoney(Number(challenge.target_amount) - Number(challenge.progress_amount), challenge.currency)} de margen.`}
        </p>
      )}

      {challenge.status === "active" && onAbandon && (
        <Button variant="ghost" size="sm" className="h-9" onClick={() => onAbandon(challenge.id)}>
          Abandonar reto
        </Button>
      )}
    </article>
  );
}
