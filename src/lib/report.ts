import { formatMoney, monthLabel } from "./format";

export interface ReportData {
  userName: string;
  period: string;
  currency: string;
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  healthScore: number;
  healthLabel: string;
  categories: { emoji: string; name: string; amount: number; share: number }[];
  months: { label: string; income: number; expense: number }[];
  insights: string[];
  completedChallenges: number;
  growthPoints: number;
}

/** Documento estructurado listo para imprimir o guardar como PDF. */
export function buildReportHtml(d: ReportData) {
  const bar = (value: number, max: number) =>
    `<div class="bar"><span style="width:${max > 0 ? Math.round((value / max) * 100) : 0}%"></span></div>`;
  const maxMonth = Math.max(...d.months.map((m) => Math.max(m.income, m.expense)), 1);

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<title>PlantWallet — Reporte ${d.period}</title>
<style>
  @page { margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, sans-serif; color: #1b2620; margin: 0; }
  header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #2f7d5b; padding-bottom:12px; }
  h1 { font-size: 22px; margin:0; letter-spacing:-0.4px; }
  h2 { font-size: 15px; margin: 26px 0 10px; color:#2f7d5b; text-transform:uppercase; letter-spacing:0.6px; }
  .muted { color:#6b7a72; font-size:12px; }
  .grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin-top:14px; }
  .kpi { border:1px solid #e2e9e5; border-radius:10px; padding:10px 12px; }
  .kpi b { display:block; font-size:16px; margin-top:2px; }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th, td { text-align:left; padding:7px 6px; border-bottom:1px solid #eef2f0; }
  td.num, th.num { text-align:right; }
  .bar { background:#eef2f0; border-radius:6px; height:8px; overflow:hidden; }
  .bar span { display:block; height:100%; background:#3f9d74; }
  ul { padding-left:18px; font-size:12px; line-height:1.6; }
  footer { margin-top:28px; border-top:1px solid #e2e9e5; padding-top:10px; font-size:11px; color:#6b7a72; display:flex; justify-content:space-between; }
</style></head>
<body>
  <header>
    <div>
      <h1>🌱 PlantWallet</h1>
      <p class="muted">Reporte financiero · ${d.period}</p>
    </div>
    <div class="muted" style="text-align:right">
      <div>${d.userName}</div>
      <div>Generado el ${new Date().toLocaleDateString("es-CO")}</div>
    </div>
  </header>

  <h2>Resumen</h2>
  <div class="grid">
    <div class="kpi"><span class="muted">Ingresos</span><b>${formatMoney(d.income, d.currency)}</b></div>
    <div class="kpi"><span class="muted">Gastos</span><b>${formatMoney(d.expense, d.currency)}</b></div>
    <div class="kpi"><span class="muted">Balance</span><b>${formatMoney(d.balance, d.currency)}</b></div>
    <div class="kpi"><span class="muted">Tasa de ahorro</span><b>${Math.round(d.savingsRate * 100)}%</b></div>
  </div>

  <h2>Salud financiera</h2>
  <p style="font-size:13px;margin:0 0 8px">${d.healthScore}/100 — ${d.healthLabel}</p>
  ${bar(d.healthScore, 100)}

  <h2>Gastos por categoría</h2>
  <table>
    <thead><tr><th>Categoría</th><th class="num">Importe</th><th class="num">%</th></tr></thead>
    <tbody>
      ${d.categories
        .map(
          (c) =>
            `<tr><td>${c.emoji} ${c.name}</td><td class="num">${formatMoney(c.amount, d.currency)}</td><td class="num">${c.share}%</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <h2>Evolución de los últimos meses</h2>
  <table>
    <thead><tr><th>Mes</th><th class="num">Ingresos</th><th class="num">Gastos</th><th style="width:35%">Comparación</th></tr></thead>
    <tbody>
      ${d.months
        .map(
          (m) =>
            `<tr><td>${m.label}</td><td class="num">${formatMoney(m.income, d.currency)}</td><td class="num">${formatMoney(m.expense, d.currency)}</td><td>${bar(m.expense, maxMonth)}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>

  <h2>Progreso y recomendaciones</h2>
  <p style="font-size:12px;margin:0 0 6px">🏆 ${d.completedChallenges} retos completados · 🌱 ${d.growthPoints} Growth Points</p>
  <ul>${d.insights.map((i) => `<li>${i}</li>`).join("")}</ul>

  <footer>
    <span>PlantWallet — Cultiva mejor tus finanzas · Información orientativa, no asesoría financiera.</span>
    <span>Página 1</span>
  </footer>
  <script>window.onload = () => setTimeout(() => window.print(), 350);</script>
</body></html>`;
}

export function currentPeriodLabel() {
  return monthLabel(0);
}
