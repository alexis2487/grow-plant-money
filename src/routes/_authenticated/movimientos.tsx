import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { EmptyState } from "@/components/EmptyState";
import { useTransactionSheet } from "./route";
import { useCategories, useDeleteTransaction, useTransactions } from "@/lib/data";
import { formatDate, formatMoney, paymentLabel } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/movimientos")({
  head: () => ({
    meta: [
      { title: "Movimientos — PlantWallet" },
      { name: "description", content: "Busca, filtra, edita y exporta todos tus ingresos y gastos." },
      { property: "og:title", content: "Movimientos — PlantWallet" },
      { property: "og:description", content: "Todos tus ingresos y gastos en un solo lugar." },
    ],
  }),
  component: Movimientos,
});

function Movimientos() {
  const { data: txs = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const del = useDeleteTransaction();
  const sheet = useTransactionSheet();

  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [cat, setCat] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      txs.filter((t) => {
        if (type !== "all" && t.type !== type) return false;
        if (cat !== "all" && t.category_id !== cat) return false;
        if (from && t.transaction_date < from) return false;
        if (to && t.transaction_date > to) return false;
        if (q) {
          const catName = categories.find((c) => c.id === t.category_id)?.name ?? "";
          const hay = `${t.description ?? ""} ${t.notes ?? ""} ${catName}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [txs, type, cat, from, to, q, categories],
  );

  function exportCsv() {
    const rows = [
      ["fecha", "tipo", "categoria", "descripcion", "importe", "moneda", "metodo_pago", "notas"],
      ...filtered.map((t) => [
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
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantwallet-movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Movimientos</h1>
        <Button variant="secondary" className="h-11 rounded-xl" onClick={exportCsv}>
          Exportar CSV
        </Button>
      </header>

      <div className="surface space-y-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por descripción o categoría"
            className="h-12 pl-9"
            aria-label="Buscar movimientos"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="!h-12" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="!h-12" aria-label="Filtrar por categoría">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-12" aria-label="Desde" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-12" aria-label="Hasta" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length ? (
        <ul className="space-y-2">
          {filtered.map((t) => {
            const c = categories.find((x) => x.id === t.category_id);
            return (
              <li key={t.id}>
                <button
                  onClick={() => setDetail(t)}
                  className="surface flex w-full items-center gap-3 p-3 text-left"
                >
                  <span className="text-xl" aria-hidden>
                    {c?.emoji ?? "📦"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {t.description || c?.name || "Movimiento"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(t.transaction_date)} · {paymentLabel(t.payment_method)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${t.type === "income" ? "text-success" : ""}`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatMoney(Number(t.amount), t.currency)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          emoji="🌱"
          title="No hay movimientos con estos filtros"
          description="Cambia los filtros o registra un nuevo ingreso o gasto."
        />
      )}

      <Drawer open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detalle del movimiento</DrawerTitle>
          </DrawerHeader>
          {detail && (
            <div className="safe-bottom space-y-4 px-4 pb-6">
              <p className="text-3xl font-bold tabular-nums">
                {detail.type === "income" ? "+" : "−"}
                {formatMoney(Number(detail.amount), detail.currency)}
              </p>
              <dl className="space-y-2 text-sm">
                <Row label="Tipo" value={detail.type === "income" ? "Ingreso" : "Gasto"} />
                <Row
                  label="Categoría"
                  value={`${categories.find((c) => c.id === detail.category_id)?.emoji ?? ""} ${
                    categories.find((c) => c.id === detail.category_id)?.name ?? "Sin categoría"
                  }`}
                />
                <Row label="Fecha" value={formatDate(detail.transaction_date, "long")} />
                <Row label="Método de pago" value={paymentLabel(detail.payment_method)} />
                <Row label="Descripción" value={detail.description || "—"} />
                <Row label="Notas" value={detail.notes || "—"} />
                {detail.is_recurring && <Row label="Recurrente" value={detail.recurring_rule ?? "sí"} />}
              </dl>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="h-12 flex-1 rounded-xl"
                  onClick={() => {
                    sheet.open(detail.type, detail);
                    setDetail(null);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" aria-hidden /> Editar
                </Button>
                <Button
                  variant="destructive"
                  className="h-12 flex-1 rounded-xl"
                  onClick={() => setToDelete(detail.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Eliminar
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se recalcularán tu balance, tu salud financiera y el progreso de tus retos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!toDelete) return;
                await del.mutateAsync(toDelete);
                setToDelete(null);
                setDetail(null);
                toast.success("Movimiento eliminado");
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
