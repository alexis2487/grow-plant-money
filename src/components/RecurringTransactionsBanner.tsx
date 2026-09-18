import { useState, useMemo } from "react";
import { Repeat, Check, CheckCheck, X, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category, Transaction } from "@/lib/types";
import { useSaveTransaction } from "@/lib/data";
import { formatMoney, isoDate, monthRange } from "@/lib/format";

interface RecurringTransactionsBannerProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

export function RecurringTransactionsBanner({
  transactions,
  categories,
  currency,
}: RecurringTransactionsBannerProps) {
  const saveTx = useSaveTransaction();
  const [expanded, setExpanded] = useState(false);
  const [busyKeys, setBusyKeys] = useState<Record<string, boolean>>({});
  const [dismissedKeys, setDismissedKeys] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("plantwallet_dismissed_recurring");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const range = monthRange(0);
  const currentMonthKey = range.start.slice(0, 7); // e.g. "2026-09"

  // 1. Encuentra movimientos recurrentes de meses anteriores que no se han registrado en el mes actual
  const pendingRecurring = useMemo(() => {
    // Transacciones en el mes actual
    const currentMonthTxs = transactions.filter(
      (t) => t.transaction_date >= range.start && t.transaction_date <= range.end
    );

    // Llaves únicas de transacciones del mes actual
    const registeredKeys = new Set(
      currentMonthTxs.map((t) =>
        `${t.type}_${t.category_id || ""}_${(t.description || "").trim().toLowerCase()}`
      )
    );

    // Candidatos recurrentes de meses pasados
    const pastRecurring = transactions
      .filter((t) => t.is_recurring && t.transaction_date < range.start)
      .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));

    const uniqueMap = new Map<string, Transaction>();

    for (const tx of pastRecurring) {
      const key = `${tx.type}_${tx.category_id || ""}_${(tx.description || "").trim().toLowerCase()}`;
      const dismissKey = `${currentMonthKey}_${key}`;

      // Si no ha sido registrada este mes, ni descartada, y es la primera vez que vemos este tipo recurrente:
      if (
        !registeredKeys.has(key) &&
        !dismissedKeys.includes(dismissKey) &&
        !uniqueMap.has(key)
      ) {
        uniqueMap.set(key, tx);
      }
    }

    return Array.from(uniqueMap.values());
  }, [transactions, range.start, range.end, currentMonthKey, dismissedKeys]);

  if (pendingRecurring.length === 0) {
    return null;
  }

  const handleDismiss = (tx: Transaction) => {
    const key = `${tx.type}_${tx.category_id || ""}_${(tx.description || "").trim().toLowerCase()}`;
    const dismissKey = `${currentMonthKey}_${key}`;
    const next = [...dismissedKeys, dismissKey];
    setDismissedKeys(next);
    try {
      localStorage.setItem("plantwallet_dismissed_recurring", JSON.stringify(next));
    } catch {
      // Ignorar errores de quota
    }
    toast.info("Movimiento recurrente omitido por este mes.");
  };

  const handleRegisterSingle = async (tx: Transaction) => {
    const key = `${tx.type}_${tx.category_id || ""}_${(tx.description || "").trim().toLowerCase()}`;
    setBusyKeys((prev) => ({ ...prev, [key]: true }));

    try {
      // Calcular la fecha para este mes: conservar el día del mes original si es posible
      const origDay = parseInt(tx.transaction_date.slice(8, 10), 10) || 1;
      const today = new Date();
      const targetDate = new Date(today.getFullYear(), today.getMonth(), origDay);
      const dateStr = isoDate(targetDate > today ? today : targetDate);

      await saveTx.mutateAsync({
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency || currency,
        category_id: tx.category_id,
        transaction_date: dateStr,
        description: tx.description,
        notes: tx.notes,
        payment_method: tx.payment_method,
        is_recurring: true,
        recurring_rule: tx.recurring_rule,
      });

      toast.success(
        `¡"${tx.description || "Movimiento"}" registrado para este mes!`
      );
    } catch (err: any) {
      toast.error("Error al registrar movimiento recurrente.");
    } finally {
      setBusyKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleRegisterAll = async () => {
    setBusyKeys({ __all__: true });
    let count = 0;
    try {
      for (const tx of pendingRecurring) {
        const origDay = parseInt(tx.transaction_date.slice(8, 10), 10) || 1;
        const today = new Date();
        const targetDate = new Date(today.getFullYear(), today.getMonth(), origDay);
        const dateStr = isoDate(targetDate > today ? today : targetDate);

        await saveTx.mutateAsync({
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency || currency,
          category_id: tx.category_id,
          transaction_date: dateStr,
          description: tx.description,
          notes: tx.notes,
          payment_method: tx.payment_method,
          is_recurring: true,
          recurring_rule: tx.recurring_rule,
        });
        count++;
      }
      toast.success(`¡Se registraron ${count} movimientos recurrentes con éxito! 🌱`);
    } catch {
      toast.error("Hubo un problema al registrar algunos movimientos.");
    } finally {
      setBusyKeys({});
    }
  };

  const totalExpense = pendingRecurring
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4 shadow-sm space-y-3 animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="rounded-2xl bg-primary/15 p-2 text-primary">
            <Repeat className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Gastos fijos del mes
              </h3>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-semibold bg-primary/10 text-primary border-none">
                {pendingRecurring.length} pendientes
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatiza tus pagos habituales con 1 toque.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Lista de movimientos recurrentes */}
      <div className="space-y-2 pt-1">
        {(expanded ? pendingRecurring : pendingRecurring.slice(0, 2)).map((tx) => {
          const cat = categories.find((c) => c.id === tx.category_id);
          const key = `${tx.type}_${tx.category_id || ""}_${(tx.description || "").trim().toLowerCase()}`;
          const isBusy = busyKeys[key] || busyKeys.__all__;

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2 rounded-2xl bg-card border border-border/60 p-2.5 px-3 text-xs shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base shrink-0">{cat?.emoji || (tx.type === "income" ? "💰" : "💸")}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {tx.description || cat?.name || "Gasto recurrente"}
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    {cat?.name} {tx.payment_method ? `• ${tx.payment_method}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`font-bold tabular-nums ${
                    tx.type === "income" ? "text-success" : "text-foreground"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatMoney(tx.amount, tx.currency || currency)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => handleRegisterSingle(tx)}
                  className="h-7 w-7 p-0 rounded-lg text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground"
                  title="Registrar este movimiento"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isBusy}
                  onClick={() => handleDismiss(tx)}
                  className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10"
                  title="Omitir este mes"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {pendingRecurring.length > 2 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-[11px] text-primary font-medium hover:underline block text-center w-full pt-1"
        >
          Ver los {pendingRecurring.length - 2} movimientos más...
        </button>
      )}

      {/* Botón de acción masiva */}
      <div className="pt-1">
        <Button
          onClick={handleRegisterAll}
          disabled={Boolean(busyKeys.__all__)}
          className="w-full h-10 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Registrar todos ({formatMoney(totalExpense, currency)}) con 1 toque
        </Button>
      </div>
    </div>
  );
}
