import { useId } from "react";
import { cn } from "@/lib/utils";
import { healthState } from "@/lib/finance";

interface Props {
  score?: number | null;
  isSprout?: boolean;
  size?: number;
  className?: string;
  potStyle?: string;
  effect?: string;
  plantStyle?: string;
  background?: string;
  backgroundStyle?: string;
}

/**
 * Ilustración vectorial rica, dinámica y colorida de la planta financiera.
 * Soporta skins personalizados de plantas, macetas, fondos y efectos animados.
 */
export function FinancialPlant({
  score = 90,
  isSprout = false,
  size = 180,
  className,
  potStyle = "pot_ceramic",
  effect = "fx_none",
  plantStyle = "plant_classic",
  background: bgProp,
  backgroundStyle,
}: Props) {
  const isInitialSprout = isSprout || score === null;
  const numScore = score ?? 90;
  const background = backgroundStyle ?? bgProp ?? "bg_room";
  const state = isInitialSprout ? "unrated" : healthState(numScore);
  const growth = Math.max(0.2, Math.min(1, numScore / 100));
  const stemHeight = 35 + growth * 75;
  const leafCount = numScore <= 0 ? 1 : Math.max(2, Math.round(growth * 8));
  const wilt = !isInitialSprout && (state === "critical" || state === "risk");

  // Colores dinámicos según estado de salud
  const healthHue = {
    unrated: "#10b981",
    excellent: "#10b981",
    healthy: "#22c55e",
    attention: "#eab308",
    risk: "#f97316",
    critical: "#ef4444",
  }[state];

  // Identificadores únicos y estables para no colisionar gradientes SVG entre múltiples plantas
  const baseId = useId();
  const uid = `fp-${baseId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div
      className={cn("relative select-none overflow-hidden rounded-3xl shadow-sm transition-all", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 160 170"
        width={size}
        height={size}
        role="img"
        aria-label={`Planta de salud financiera, puntuación ${score} de 100`}
        className="h-full w-full"
      >
        <defs>
          {/* ============ FONDOS GRADIENTES ============ */}
          <linearGradient id={`${uid}-bg-room`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id={`${uid}-bg-garden`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="50%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>

          <linearGradient id={`${uid}-bg-sunrise`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="45%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <linearGradient id={`${uid}-bg-greenhouse`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="60%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>

          <linearGradient id={`${uid}-bg-zen`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="55%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>

          <linearGradient id={`${uid}-bg-night`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#31104b" />
          </linearGradient>

          {/* ============ PLANTAS GRADIENTES ============ */}
          <linearGradient id={`${uid}-leaf-classic`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          <linearGradient id={`${uid}-cactus`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id={`${uid}-succulent-1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id={`${uid}-monstera-var`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id={`${uid}-bonsai-bark`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id={`${uid}-bonsai-foliage`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          <linearGradient id={`${uid}-bamboo-stem`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4d7c0f" />
            <stop offset="50%" stopColor="#a3e635" />
            <stop offset="100%" stopColor="#65a30d" />
          </linearGradient>

          <linearGradient id={`${uid}-tree-gold`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="60%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id={`${uid}-carnivorous`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#881337" />
            <stop offset="60%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fda4af" />
          </linearGradient>

          {/* ============ MACETAS GRADIENTES ============ */}
          <linearGradient id={`${uid}-pot-ceramic`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c2410c" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>

          <linearGradient id={`${uid}-pot-wood`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id={`${uid}-pot-minimal`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id={`${uid}-pot-metal`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id={`${uid}-pot-crystal`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
            <stop offset="45%" stopColor="rgba(186, 230, 253, 0.45)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.6)" />
          </linearGradient>

          <linearGradient id={`${uid}-pot-cyber`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Filtro de sombra suave */}
          <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* ========================================================
            1. FONDO (BACKGROUND)
        ======================================================== */}
        {background === "bg_night" ? (
          <g>
            <rect x="0" y="0" width="160" height="170" fill={`url(#${uid}-bg-night)`} />
            {/* Luna y estrellas */}
            <circle cx="132" cy="28" r="14" fill="#fef08a" opacity="0.9" filter={`url(#${uid}-shadow)`} />
            <circle cx="127" cy="24" r="13" fill="#1e1b4b" />
            <circle cx="32" cy="25" r="1.5" fill="#ffffff" opacity="0.8" className="animate-sparkle" />
            <circle cx="65" cy="18" r="1.2" fill="#ffffff" opacity="0.7" />
            <circle cx="88" cy="35" r="1.5" fill="#fef08a" opacity="0.85" className="animate-sparkle" />
            <circle cx="22" cy="50" r="1.2" fill="#ffffff" opacity="0.6" />
          </g>
        ) : background === "bg_sunrise" ? (
          <g>
            <rect x="0" y="0" width="160" height="170" fill={`url(#${uid}-bg-sunrise)`} />
            {/* Rayos de sol */}
            <circle cx="80" cy="130" r="60" fill="#fef08a" opacity="0.3" className="animate-pulse-glow" />
            <circle cx="80" cy="130" r="40" fill="#fed7aa" opacity="0.4" />
          </g>
        ) : background === "bg_garden" ? (
          <g>
            <rect x="0" y="0" width="160" height="170" fill={`url(#${uid}-bg-garden)`} />
            {/* Siluetas de hojas tropicales al fondo */}
            <path d="M-10 90 C 20 60, 40 80, 50 120 C 20 110, 5 130, -10 140 Z" fill="#059669" opacity="0.18" />
            <path d="M170 80 C 140 50, 120 70, 110 110 C 140 100, 155 120, 170 130 Z" fill="#059669" opacity="0.18" />
          </g>
        ) : background === "bg_greenhouse" ? (
          <g>
            <rect x="0" y="0" width="160" height="170" fill={`url(#${uid}-bg-greenhouse)`} />
            {/* Arcos de invernadero victoriano */}
            <path d="M15 170 V 35 C 45 10, 115 10, 145 35 V 170" stroke="#0284c7" strokeWidth="2" opacity="0.25" fill="none" />
            <line x1="80" y1="12" x2="80" y2="170" stroke="#0284c7" strokeWidth="1.5" opacity="0.25" />
            <line x1="15" y1="65" x2="145" y2="65" stroke="#0284c7" strokeWidth="1.5" opacity="0.25" />
          </g>
        ) : background === "bg_zen" ? (
          <g>
            <rect x="0" y="0" width="160" height="170" fill={`url(#${uid}-bg-zen)`} />
            {/* Cañas de bambú lejanas y arena zen */}
            <line x1="20" y1="0" x2="20" y2="140" stroke="#ca8a04" strokeWidth="3" opacity="0.2" />
            <line x1="30" y1="0" x2="30" y2="140" stroke="#ca8a04" strokeWidth="2" opacity="0.15" />
            <ellipse cx="80" cy="155" rx="70" ry="12" fill="#ea580c" opacity="0.08" />
          </g>
        ) : (
          /* bg_room por defecto */
          <g>
            <rect x="0" y="0" width="160" height="170" fill={`url(#${uid}-bg-room)`} />
            {/* Marco de ventana sutil */}
            <rect x="25" y="15" width="110" height="105" rx="14" fill="#ffffff" opacity="0.65" />
            <line x1="80" y1="15" x2="80" y2="120" stroke="#cbd5e1" strokeWidth="2" opacity="0.6" />
            <line x1="25" y1="68" x2="135" y2="68" stroke="#cbd5e1" strokeWidth="2" opacity="0.6" />
          </g>
        )}

        {/* Sombra base debajo de la maceta */}
        <ellipse cx="80" cy="154" rx="42" ry="7" fill={background === "bg_night" ? "#090d16" : "rgba(0,0,0,0.14)"} />

        {/* ========================================================
            2. PLANTA SEGÚN SKIN SELECCIONADO
        ======================================================== */}
        <g className={wilt ? undefined : "animate-sway"}>
          {isInitialSprout ? (
            /* ============ BROTE / SEMILLA INICIAL (SIN MOVIMIENTOS) ============ */
            <g>
              {/* Montículo de tierra fértil */}
              <ellipse cx="80" cy="148" rx="22" ry="5" fill="#3d1d07" opacity="0.9" />

              {/* Tallo del brote tierno creciendo */}
              <path
                d="M80 148 C 79 135, 81 122, 80 108"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />

              {/* Cotiledón / Hoja izquierda de brote */}
              <g className="animate-rise" style={{ animationDelay: "0.05s" }}>
                <ellipse
                  cx="69"
                  cy="104"
                  rx="13"
                  ry="7.5"
                  fill={`url(#${uid}-leaf-classic)`}
                  transform="rotate(-28 69 104)"
                  filter={`url(#${uid}-shadow)`}
                />
                <line x1="78" y1="108" x2="63" y2="101" stroke="#047857" strokeWidth="1.2" opacity="0.5" />
              </g>

              {/* Cotiledón / Hoja derecha de brote */}
              <g className="animate-rise" style={{ animationDelay: "0.15s" }}>
                <ellipse
                  cx="91"
                  cy="104"
                  rx="13"
                  ry="7.5"
                  fill={`url(#${uid}-leaf-classic)`}
                  transform="rotate(28 91 104)"
                  filter={`url(#${uid}-shadow)`}
                />
                <line x1="82" y1="108" x2="97" y2="101" stroke="#047857" strokeWidth="1.2" opacity="0.5" />
              </g>

              {/* Pequeño brote naciente en el centro con destello dorado de vida */}
              <ellipse cx="80" cy="101" rx="4.5" ry="8" fill="#6ee7b7" />
              <circle cx="80" cy="90" r="3.5" fill="#facc15" opacity="0.95" className="animate-pulse" />
            </g>
          ) : plantStyle === "plant_cactus" ? (
            <g>
              {/* Tallo principal del cactus con relieve */}
              <rect
                x="68"
                y={150 - stemHeight}
                width="24"
                height={stemHeight}
                rx="12"
                fill={`url(#${uid}-cactus)`}
                filter={`url(#${uid}-shadow)`}
              />
              <path
                d={`M 74 ${150 - stemHeight + 8} V 146 M 80 ${150 - stemHeight + 6} V 146 M 86 ${150 - stemHeight + 8} V 146`}
                stroke="#064e3b"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.65"
              />
              {/* Brazo izquierdo */}
              {score >= 40 && (
                <path
                  d={`M 70 ${150 - stemHeight * 0.45} H 54 C 48 ${150 - stemHeight * 0.45}, 48 ${150 - stemHeight * 0.75}, 54 ${150 - stemHeight * 0.75} H 58 V ${150 - stemHeight * 0.55} H 70`}
                  fill={`url(#${uid}-cactus)`}
                />
              )}
              {/* Brazo derecho */}
              {score >= 60 && (
                <path
                  d={`M 90 ${150 - stemHeight * 0.35} H 106 C 112 ${150 - stemHeight * 0.35}, 112 ${150 - stemHeight * 0.65}, 106 ${150 - stemHeight * 0.65} H 102 V ${150 - stemHeight * 0.45} H 90`}
                  fill={`url(#${uid}-cactus)`}
                />
              )}
              {/* Flores fucsias florecientes */}
              {score >= 50 && (
                <g className="animate-pulse-glow">
                  <circle cx="80" cy={150 - stemHeight} r="8" fill="#ec4899" />
                  <circle cx="80" cy={150 - stemHeight} r="5" fill="#f43f5e" />
                  <circle cx="80" cy={150 - stemHeight} r="2.5" fill="#fef08a" />
                  {/* Pétalos estrella */}
                  <path
                    d={`M 80 ${150 - stemHeight - 11} L 83 ${150 - stemHeight - 5} L 89 ${150 - stemHeight} L 83 ${150 - stemHeight + 5} L 80 ${150 - stemHeight + 11} L 77 ${150 - stemHeight + 5} L 71 ${150 - stemHeight} L 77 ${150 - stemHeight - 5} Z`}
                    fill="#f472b6"
                    opacity="0.8"
                  />
                </g>
              )}
            </g>
          ) : plantStyle === "plant_succulent" ? (
            /* ============ SKIN: SUCULENTA ARCOÍRIS ============ */
            <g transform={`translate(80, ${150 - stemHeight * 0.45}) scale(${0.7 + growth * 0.45})`}>
              {/* Capa de pétalos externa */}
              {[-60, -30, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270].map((angle, i) => (
                <path
                  key={`out-${i}`}
                  d="M 0 0 C -12 -18, -10 -36, 0 -44 C 10 -36, 12 -18, 0 0 Z"
                  fill={`url(#${uid}-succulent-1)`}
                  opacity="0.85"
                  transform={`rotate(${angle})`}
                />
              ))}
              {/* Capa de pétalos interna */}
              {[-45, -15, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285].map((angle, i) => (
                <path
                  key={`in-${i}`}
                  d="M 0 0 C -8 -12, -7 -25, 0 -30 C 7 -25, 8 -12, 0 0 Z"
                  fill="#f472b6"
                  opacity="0.9"
                  transform={`rotate(${angle})`}
                />
              ))}
              <circle cx="0" cy="0" r="7" fill="#fef08a" />
              <circle cx="0" cy="0" r="3.5" fill="#f43f5e" />
            </g>
          ) : plantStyle === "plant_bonsai" ? (
            /* ============ SKIN: BONSÁI SAKURA ZEN ============ */
            <g>
              {/* Tronco retorcido de bonsái japonés */}
              <path
                d="M 76 150 C 74 135, 62 125, 66 110 C 70 95, 96 90, 84 75 C 78 68, 70 60, 75 50"
                stroke={`url(#${uid}-bonsai-bark)`}
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 70 105 C 85 100, 102 96, 110 88"
                stroke={`url(#${uid}-bonsai-bark)`}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              {/* Almohadillas de follaje verde musgo */}
              <ellipse cx="62" cy="74" rx="20" ry="10" fill={`url(#${uid}-bonsai-foliage)`} />
              <ellipse cx="112" cy="85" rx="18" ry="9" fill={`url(#${uid}-bonsai-foliage)`} />
              <ellipse cx="78" cy="48" rx="26" ry="12" fill={`url(#${uid}-bonsai-foliage)`} />
              {/* Flores de sakura rosadas */}
              {score >= 50 && (
                <g>
                  <circle cx="60" cy="70" r="3" fill="#fbcfe8" />
                  <circle cx="68" cy="76" r="2.5" fill="#f472b6" />
                  <circle cx="110" cy="82" r="3" fill="#fbcfe8" />
                  <circle cx="118" cy="87" r="2" fill="#f472b6" />
                  <circle cx="75" cy="42" r="3.5" fill="#fbcfe8" />
                  <circle cx="86" cy="45" r="3" fill="#f472b6" />
                  <circle cx="92" cy="40" r="2" fill="#fef08a" />
                </g>
              )}
            </g>
          ) : plantStyle === "plant_bamboo" ? (
            /* ============ SKIN: BAMBÚ DE LA FORTUNA ============ */
            <g>
              {/* 3 Cañas de bambú segmentadas */}
              {[
                { x: 67, h: stemHeight * 0.9, w: 6 },
                { x: 80, h: stemHeight * 1.05, w: 7 },
                { x: 93, h: stemHeight * 0.85, w: 6 },
              ].map((c, i) => (
                <g key={i}>
                  <line
                    x1={c.x}
                    y1={150}
                    x2={c.x}
                    y2={150 - c.h}
                    stroke={`url(#${uid}-bamboo-stem)`}
                    strokeWidth={c.w}
                    strokeLinecap="round"
                  />
                  {/* Nudos de bambú */}
                  <line x1={c.x - c.w * 0.7} y1={150 - c.h * 0.3} x2={c.x + c.w * 0.7} y2={150 - c.h * 0.3} stroke="#365314" strokeWidth="2" />
                  <line x1={c.x - c.w * 0.7} y1={150 - c.h * 0.65} x2={c.x + c.w * 0.7} y2={150 - c.h * 0.65} stroke="#365314" strokeWidth="2" />
                  {/* Brotes de hojas estilizadas */}
                  <path
                    d={`M ${c.x} ${150 - c.h} Q ${c.x - 18} ${150 - c.h - 12} ${c.x - 22} ${150 - c.h + 2} Q ${c.x - 10} ${150 - c.h - 2} ${c.x} ${150 - c.h}`}
                    fill="#84cc16"
                  />
                  <path
                    d={`M ${c.x} ${150 - c.h} Q ${c.x + 18} ${150 - c.h - 12} ${c.x + 22} ${150 - c.h + 2} Q ${c.x + 10} ${150 - c.h - 2} ${c.x} ${150 - c.h}`}
                    fill="#65a30d"
                  />
                </g>
              ))}
              {/* Lazo rojo de prosperidad y oro */}
              <rect x="63" y="128" width="34" height="6" rx="3" fill="#dc2626" />
              <circle cx="80" cy="131" r="4" fill="#facc15" />
            </g>
          ) : plantStyle === "plant_monstera" ? (
            /* ============ SKIN: MONSTERA VARIEGATA REAL ============ */
            <g>
              <path
                d={`M80 150 C 76 130, 84 100, 80 ${150 - stemHeight}`}
                stroke="#047857"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Grandes hojas monstera con cortes */}
              {Array.from({ length: leafCount }).map((_, i) => {
                const t = (i + 1) / (leafCount + 1);
                const y = 150 - stemHeight * t;
                const dir = i % 2 === 0 ? 1 : -1;
                const sc = 0.65 + growth * 0.5;
                return (
                  <g
                    key={i}
                    transform={`translate(${80 + dir * 18 * sc}, ${y}) rotate(${dir * (wilt ? 35 : -22)}) scale(${sc})`}
                    className="animate-rise"
                  >
                    <path
                      d="M 0 0 C 18 -15, 30 -35, 18 -55 C 5 -45, -10 -40, -18 -25 C -15 -10, -8 -5, 0 0 Z"
                      fill={`url(#${uid}-monstera-var)`}
                      filter={`url(#${uid}-shadow)`}
                    />
                    {/* Cortes botánicos fenestrados */}
                    <path d="M 6 -20 L 14 -24 M 8 -32 L 18 -36 M 5 -42 L 12 -46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  </g>
                );
              })}
            </g>
          ) : plantStyle === "plant_tree" ? (
            /* ============ SKIN: ÁRBOL DE LA ABUNDANCIA ============ */
            <g>
              <path
                d="M 80 150 C 77 130, 83 110, 80 85"
                stroke="#78350f"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Copa dorada frondosa */}
              <ellipse cx="80" cy="72" rx="34" ry="24" fill={`url(#${uid}-tree-gold)`} filter={`url(#${uid}-shadow)`} />
              <ellipse cx="62" cy="78" rx="20" ry="16" fill="#f59e0b" opacity="0.9" />
              <ellipse cx="98" cy="78" rx="20" ry="16" fill="#fbbf24" opacity="0.9" />
              <ellipse cx="80" cy="56" rx="22" ry="16" fill="#fef08a" opacity="0.95" />
              {/* Monedas / Gemas resplandecientes */}
              <circle cx="68" cy="65" r="4.5" fill="#10b981" stroke="#fef08a" strokeWidth="1.5" className="animate-sparkle" />
              <circle cx="92" cy="68" r="4.5" fill="#10b981" stroke="#fef08a" strokeWidth="1.5" className="animate-sparkle" />
              <circle cx="80" cy="50" r="5" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
            </g>
          ) : plantStyle === "plant_carnivorous" ? (
            /* ============ SKIN: PLANTA EXÓTICA CARNÍVORA ============ */
            <g>
              <path
                d="M 80 150 C 70 120, 95 90, 80 65"
                stroke="#15803d"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Cáliz de jarra carmesí */}
              <path
                d="M 75 80 C 65 95, 68 115, 80 118 C 92 115, 95 95, 85 80 Z"
                fill={`url(#${uid}-carnivorous)`}
                filter={`url(#${uid}-shadow)`}
              />
              <ellipse cx="80" cy="80" rx="9" ry="4" fill="#4c0519" />
              {/* Capucha protectora y gotas de néctar */}
              <path d="M 72 78 Q 80 64 88 78 Z" fill="#fda4af" opacity="0.9" />
              <circle cx="80" cy="74" r="2.5" fill="#38bdf8" opacity="0.8" className="animate-pulse-glow" />
            </g>
          ) : (
            /* ============ SKIN: PLANTA MONSTERA CLÁSICA (DEFAULT) ============ */
            <g>
              <path
                d={`M80 150 C ${wilt ? 90 : 76} ${150 - stemHeight * 0.5}, ${wilt ? 88 : 84} ${150 - stemHeight * 0.75}, ${wilt ? 92 : 80} ${150 - stemHeight}`}
                stroke="#047857"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {Array.from({ length: leafCount }).map((_, i) => {
                const t = (i + 1) / (leafCount + 1);
                const y = 150 - stemHeight * t;
                const dir = i % 2 === 0 ? 1 : -1;
                const sc = 0.6 + growth * 0.5 * (1 - t * 0.3);
                return (
                  <g
                    key={i}
                    className="animate-rise"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <ellipse
                      cx={80 + dir * 16 * sc}
                      cy={y}
                      rx={18 * sc}
                      ry={9.5 * sc}
                      fill={wilt ? healthHue : `url(#${uid}-leaf-classic)`}
                      opacity={0.94}
                      transform={`rotate(${dir * (wilt ? 35 : -18)} ${80 + dir * 16 * sc} ${y})`}
                      filter={`url(#${uid}-shadow)`}
                    />
                    {/* Nervadura de la hoja */}
                    <line
                      x1={80 + dir * 5 * sc}
                      y1={y}
                      x2={80 + dir * 26 * sc}
                      y2={y + (wilt ? 6 : -3)}
                      stroke="#064e3b"
                      strokeWidth="1.2"
                      opacity="0.4"
                    />
                  </g>
                );
              })}
              {score >= 88 && (
                <circle cx="80" cy={150 - stemHeight - 5} r="7" fill="#facc15" opacity="0.95" className="animate-sparkle" />
              )}
            </g>
          )}
        </g>

        {/* ========================================================
            3. MACETA (POT) SEGÚN SKIN SELECCIONADO
        ======================================================== */}
        {potStyle === "pot_wood" ? (
          /* Maceta de madera rústica con aros de bronce */
          <g>
            <path d="M55 150 L60 120 H100 L105 150 Z" fill={`url(#${uid}-pot-wood)`} filter={`url(#${uid}-shadow)`} />
            {/* Aros de bronce pulido */}
            <rect x="58" y="125" width="44" height="4" fill="#f59e0b" opacity="0.9" />
            <rect x="56" y="142" width="48" height="4" fill="#f59e0b" opacity="0.9" />
            <rect x="54" y="117" width="52" height="6" rx="3" fill="#78350f" />
          </g>
        ) : potStyle === "pot_minimal" ? (
          /* Maceta blanca nórdica moderna con trípode de madera */
          <g>
            {/* Patas trípode de madera */}
            <line x1="62" y1="140" x2="52" y2="155" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
            <line x1="98" y1="140" x2="108" y2="155" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
            <line x1="80" y1="142" x2="80" y2="156" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
            {/* Cuenco blanco puro */}
            <ellipse cx="80" cy="132" rx="24" ry="16" fill={`url(#${uid}-pot-minimal)`} filter={`url(#${uid}-shadow)`} />
          </g>
        ) : potStyle === "pot_metal" ? (
          /* Maceta metálica de latón dorado */
          <g>
            <path d="M56 150 L58 122 H102 L104 150 Z" fill={`url(#${uid}-pot-metal)`} filter={`url(#${uid}-shadow)`} />
            <rect x="54" y="116" width="52" height="9" rx="4" fill={`url(#${uid}-pot-metal)`} />
            <line x1="66" y1="116" x2="66" y2="150" stroke="#fef08a" strokeWidth="3" opacity="0.4" />
          </g>
        ) : potStyle === "pot_crystal" ? (
          /* Terrario de cristal cuarzo */
          <g>
            {/* Sustrato y capas visibles */}
            <path d="M57 150 L61 122 H99 L103 150 Z" fill="rgba(180, 83, 9, 0.4)" />
            <ellipse cx="80" cy="144" rx="21" ry="5" fill="#3f3f46" />
            <ellipse cx="80" cy="134" rx="20" ry="4" fill="#047857" opacity="0.6" />
            {/* Vidrio reflectante */}
            <path d="M56 150 L60 122 H100 L104 150 Z" fill={`url(#${uid}-pot-crystal)`} filter={`url(#${uid}-shadow)`} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <rect x="54" y="117" width="52" height="7" rx="3.5" fill="rgba(255,255,255,0.85)" />
          </g>
        ) : potStyle === "pot_cyber" ? (
          /* Maceta Cyberpunk con luces LED de neón */
          <g>
            <path d="M55 150 L62 120 H98 L105 150 Z" fill={`url(#${uid}-pot-cyber)`} filter={`url(#${uid}-shadow)`} />
            <line x1="60" y1="130" x2="100" y2="130" stroke="#06b6d4" strokeWidth="3" className="animate-pulse-glow" />
            <line x1="57" y1="142" x2="103" y2="142" stroke="#ec4899" strokeWidth="3" className="animate-pulse-glow" />
            <polygon points="76,134 84,134 80,139" fill="#06b6d4" />
            <rect x="54" y="116" width="52" height="7" rx="3.5" fill="#0284c7" />
          </g>
        ) : (
          /* pot_ceramic por defecto */
          <g>
            <path d="M56 150 L60 122 H100 L104 150 Z" fill={`url(#${uid}-pot-ceramic)`} filter={`url(#${uid}-shadow)`} />
            <rect x="54" y="116" width="52" height="10" rx="5" fill={`url(#${uid}-pot-ceramic)`} />
            {/* Ribete dorado decorativo */}
            <line x1="57" y1="126" x2="103" y2="126" stroke="#fef08a" strokeWidth="2.5" opacity="0.9" />
          </g>
        )}

        {/* ========================================================
            4. EFECTOS ANIMADOS (EFFECTS)
        ======================================================== */}
        {effect === "fx_petals" ? (
          /* Lluvia de pétalos sakura */
          <g className="animate-float">
            <ellipse cx="44" cy="45" rx="5" ry="3" fill="#fbcfe8" opacity="0.85" transform="rotate(25 44 45)" />
            <ellipse cx="118" cy="38" rx="6" ry="3.5" fill="#f472b6" opacity="0.75" transform="rotate(-35 118 38)" />
            <ellipse cx="38" cy="85" rx="4.5" ry="2.5" fill="#fbcfe8" opacity="0.8" transform="rotate(40 38 85)" />
            <ellipse cx="124" cy="95" rx="5" ry="3" fill="#f472b6" opacity="0.7" transform="rotate(-20 124 95)" />
          </g>
        ) : effect === "fx_leaves" ? (
          /* Hojas verdes flotando */
          <g className="animate-float">
            <path d="M 40 50 Q 48 40 56 46 Q 50 58 40 50 Z" fill="#22c55e" opacity="0.8" />
            <path d="M 120 60 Q 112 50 104 56 Q 110 68 120 60 Z" fill="#4ade80" opacity="0.75" />
            <path d="M 35 100 Q 42 92 48 97 Q 44 105 35 100 Z" fill="#16a34a" opacity="0.7" />
          </g>
        ) : effect === "fx_fireflies" ? (
          /* Luciérnagas resplandecientes pulsantes */
          <g className="animate-pulse-glow">
            <circle cx="42" cy="55" r="5" fill="#fef08a" opacity="0.3" />
            <circle cx="42" cy="55" r="2.5" fill="#facc15" />
            <circle cx="120" cy="48" r="6" fill="#fef08a" opacity="0.3" />
            <circle cx="120" cy="48" r="3" fill="#a3e635" />
            <circle cx="36" cy="105" r="4.5" fill="#fef08a" opacity="0.25" />
            <circle cx="36" cy="105" r="2.2" fill="#facc15" />
            <circle cx="126" cy="98" r="5" fill="#fef08a" opacity="0.3" />
            <circle cx="126" cy="98" r="2.5" fill="#facc15" />
          </g>
        ) : effect === "fx_aura" ? (
          /* Aura de prosperidad mística */
          <g className="animate-pulse-glow">
            <circle cx="80" cy="100" r="54" stroke="#10b981" strokeWidth="2.5" opacity="0.35" fill="none" />
            <circle cx="80" cy="100" r="62" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" fill="none" />
          </g>
        ) : effect === "fx_particles" ? (
          /* Chispas de oro & magia */
          <g className="animate-sparkle">
            <circle cx="46" cy="48" r="3" fill="#facc15" opacity="0.9" />
            <circle cx="116" cy="38" r="2.5" fill="#fef08a" opacity="0.85" />
            <circle cx="35" cy="85" r="2" fill="#fbbf24" opacity="0.8" />
            <circle cx="125" cy="82" r="3" fill="#fef08a" opacity="0.9" />
            <polygon points="80,18 82,23 87,24 83,27 84,32 80,29 76,32 77,27 73,24 78,23" fill="#facc15" opacity="0.85" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
