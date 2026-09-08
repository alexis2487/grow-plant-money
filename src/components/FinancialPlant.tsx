import { cn } from "@/lib/utils";
import { healthState } from "@/lib/finance";

interface Props {
  score: number;
  size?: number;
  className?: string;
  potStyle?: string;
  effect?: string;
  plantStyle?: string;
}

/**
 * Ilustración vectorial de la planta de salud financiera.
 * Crece, se llena de hojas y cambia de color según la puntuación (0-100).
 */
export function FinancialPlant({ score, size = 180, className, potStyle = "pot_ceramic", effect, plantStyle = "plant_classic" }: Props) {
  const state = healthState(score);
  const growth = Math.max(0.12, Math.min(1, score / 100));
  const stemHeight = 30 + growth * 78;
  const leafCount = score <= 0 ? 0 : Math.max(1, Math.round(growth * 8));
  const wilt = state === "critical" || state === "risk";

  const leafColor = {
    excellent: "var(--leaf)",
    healthy: "var(--leaf)",
    attention: "var(--warning)",
    risk: "var(--warning)",
    critical: "var(--danger)",
  }[state];

  const potFill = {
    pot_ceramic: "var(--accent)",
    pot_wood: "oklch(0.6 0.07 60)",
    pot_minimal: "var(--secondary)",
    pot_metal: "oklch(0.75 0.02 250)",
  }[potStyle] ?? "var(--accent)";

  const leaves = Array.from({ length: leafCount }, (_, i) => {
    const t = (i + 1) / (leafCount + 1);
    const y = 150 - stemHeight * t;
    const dir = i % 2 === 0 ? 1 : -1;
    const scale = 0.55 + growth * 0.55 * (1 - t * 0.35);
    return { y, dir, scale, delay: i * 0.07 };
  });

  const isCactus = plantStyle === "plant_cactus";

  return (
    <div className={cn("relative select-none", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 170" width={size} height={size} role="img" aria-label={`Planta de salud financiera, puntuación ${score} de 100`}>
        <ellipse cx="80" cy="158" rx="42" ry="6" fill="var(--muted)" />
        <g className={wilt ? undefined : "animate-sway"}>
          <path
            d={`M80 150 C ${wilt ? 92 : 76} ${150 - stemHeight * 0.5}, ${wilt ? 88 : 84} ${150 - stemHeight * 0.75}, ${wilt ? 92 : 80} ${150 - stemHeight}`}
            stroke="var(--leaf-deep)"
            strokeWidth={isCactus ? 9 : 4}
            strokeLinecap="round"
            fill="none"
          />
          {leaves.map((l, i) => (
            <g key={i} className="animate-rise" style={{ animationDelay: `${l.delay}s` }}>
              <ellipse
                cx={80 + l.dir * 15 * l.scale}
                cy={l.y}
                rx={17 * l.scale}
                ry={8.5 * l.scale}
                fill={leafColor}
                opacity={0.92}
                transform={`rotate(${l.dir * (wilt ? 35 : -18)} ${80 + l.dir * 15 * l.scale} ${l.y})`}
              />
            </g>
          ))}
          {score >= 90 && (
            <circle cx="80" cy={150 - stemHeight - 4} r="7" fill="var(--warning)" opacity="0.9" />
          )}
        </g>
        <path d="M56 150 L60 122 H100 L104 150 Z" fill={potFill} />
        <rect x="54" y="116" width="52" height="10" rx="5" fill={potFill} />
        {effect === "fx_particles" && (
          <>
            <circle cx="46" cy="70" r="2.5" fill="var(--leaf)" opacity="0.6" className="animate-rise" />
            <circle cx="116" cy="52" r="2" fill="var(--leaf)" opacity="0.5" className="animate-rise" />
          </>
        )}
      </svg>
    </div>
  );
}
