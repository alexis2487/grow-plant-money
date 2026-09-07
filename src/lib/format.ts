export const CURRENCIES = [
  { code: "COP", label: "Peso colombiano", symbol: "$" },
  { code: "USD", label: "Dólar estadounidense", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "MXN", label: "Peso mexicano", symbol: "$" },
  { code: "GBP", label: "Libra esterlina", symbol: "£" },
  { code: "BRL", label: "Real brasileño", symbol: "R$" },
  { code: "CAD", label: "Dólar canadiense", symbol: "$" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const ZERO_DECIMALS = new Set(["COP"]);

export function formatMoney(value: number, currency = "COP", compact = false) {
  const decimals = ZERO_DECIMALS.has(currency) ? 0 : 2;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: compact ? 0 : decimals,
    maximumFractionDigits: compact ? 0 : decimals,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

export function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}\b)/g, "");
  const normalized = cleaned.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatDate(date: string | Date, style: "short" | "long" = "short") {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: style === "long" ? "long" : "2-digit",
    year: "numeric",
  }).format(d);
}

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function monthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { start: isoDate(start), end: isoDate(end) };
}

export function monthLabel(offset = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(d);
}

export function greeting(name?: string | null) {
  const h = new Date().getHours();
  const base = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  return name ? `${base}, ${name.split(" ")[0]}` : base;
}

export const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "debit", label: "Tarjeta débito" },
  { value: "credit", label: "Tarjeta crédito" },
  { value: "transfer", label: "Transferencia" },
  { value: "other", label: "Otro" },
];

export function paymentLabel(value?: string | null) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? "—";
}
