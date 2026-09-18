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
import { paymentLabel } from "@/lib/format";
import { shareFileNative } from "@/lib/native";
import { useTranslation } from "@/i18n";
import type { Transaction } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/movimientos")({
  head: () => ({
    meta: [
      { title: "Movimientos — PlantWallet" },
      {
        name: "description",
        content: "Busca, filtra, edita y exporta todos tus ingresos y gastos.",
      },
      { property: "og:title", content: "Movimientos — PlantWallet" },
      { property: "og:description", content: "Todos tus ingresos y gastos en un solo lugar." },
    ],
  }),
  component: Movimientos,
});

function Movimientos() {
  const { t, formatMoney, formatDate } = useTranslation();
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

  async function exportCsv() {
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
    const fileName = `${t("transactions.exportFileName")}${new Date().toISOString().slice(0, 10)}.csv`;
    await shareFileNative(
      fileName,
      `\uFEFF${csv}`,
      t("transactions.exportTitle"),
      t("transactions.exportDesc"),
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("transactions.title")}</h1>
        <Button variant="secondary" className="h-11 rounded-xl" onClick={exportCsv}>
          {t("transactions.exportCsv")}
        </Button>
      </header>

      <div className="surface space-y-3 p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("transactions.searchPlaceholder")}
            className="h-12 pl-9"
            aria-label={t("transactions.searchPlaceholder")}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="!h-12" aria-label={t("common.filter")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("transactions.filterAll")}</SelectItem>
              <SelectItem value="income">{t("transactions.filterIncome")}</SelectItem>
              <SelectItem value="expense">{t("transactions.filterExpense")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="!h-12" aria-label={t("common.category")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("transactions.allCategories")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-12"
            aria-label="Desde"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-12"
            aria-label="Hasta"
          />
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
          title={t("transactions.emptyTitle")}
          description={t("transactions.emptyDescription")}
        />
      )}

      <Drawer open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("transactions.detailTitle")}</DrawerTitle>
          </DrawerHeader>
          {detail && (
            <div className="safe-bottom space-y-4 px-4 pb-6">
              <p className="text-3xl font-bold tabular-nums">
                {detail.type === "income" ? "+" : "−"}
                {formatMoney(Number(detail.amount), detail.currency)}
              </p>
              <dl className="space-y-2 text-sm">
                <Row
                  label={t("common.income") + "/" + t("common.expense")}
                  value={detail.type === "income" ? t("common.income") : t("common.expense")}
                />
                <Row
                  label={t("common.category")}
                  value={`${categories.find((c) => c.id === detail.category_id)?.emoji ?? ""} ${
                    categories.find((c) => c.id === detail.category_id)?.name ?? "—"
                  }`}
                />
                <Row label={t("common.date")} value={formatDate(detail.transaction_date, "long")} />
                <Row
                  label={t("common.paymentMethod")}
                  value={paymentLabel(detail.payment_method)}
                />
                <Row label={t("common.description")} value={detail.description || "—"} />
                <Row label={t("common.notes")} value={detail.notes || "—"} />
                {detail.is_recurring && (
                  <Row label={t("common.recurring")} value={detail.recurring_rule ?? "✓"} />
                )}
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
                  <Pencil className="mr-2 h-4 w-4" aria-hidden />{" "}
                  {t("transactions.editTransaction")}
                </Button>
                <Button
                  variant="destructive"
                  className="h-12 flex-1 rounded-xl"
                  onClick={() => setToDelete(detail.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden />{" "}
                  {t("transactions.deleteTransaction")}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("transactions.confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("transactions.confirmDeleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!toDelete) return;
                await del.mutateAsync(toDelete);
                setToDelete(null);
                setDetail(null);
                toast.success(t("transactions.deletedSuccess"));
              }}
            >
              {t("common.delete")}
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
