import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, PAYMENT_METHODS, formatMoney, isoDate, parseAmount } from "@/lib/format";
import { useCategories, useProfile, useSaveTransaction } from "@/lib/data";
import type { Transaction, TxType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: TxType;
  editing?: Transaction | null;
}

export function TransactionSheet({ open, onOpenChange, type, editing }: Props) {
  const { data: profile } = useProfile();
  const { data: categories = [] } = useCategories();
  const save = useSaveTransaction();

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(profile?.base_currency ?? "COP");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(isoDate(new Date()));
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState("cash");
  const [recurring, setRecurring] = useState(false);
  const [rule, setRule] = useState("monthly");
  const [more, setMore] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setAmount(String(editing.amount));
      setCurrency(editing.currency);
      setCategoryId(editing.category_id);
      setDate(editing.transaction_date);
      setDescription(editing.description ?? "");
      setNotes(editing.notes ?? "");
      setMethod(editing.payment_method ?? "cash");
      setRecurring(editing.is_recurring);
      setRule(editing.recurring_rule ?? "monthly");
      setMore(true);
    } else {
      setAmount("");
      setCurrency(profile?.base_currency ?? "COP");
      setCategoryId(null);
      setDate(isoDate(new Date()));
      setDescription("");
      setNotes("");
      setMethod("cash");
      setRecurring(false);
      setMore(false);
    }
  }, [open, editing, profile?.base_currency]);

  const kind: TxType = editing?.type ?? type;
  const options = categories.filter((c) => c.type === kind && c.is_active);
  const value = parseAmount(amount);

  async function handleSave() {
    if (value <= 0) return toast.error("Escribe un valor mayor que cero.");
    if (!categoryId) return toast.error("Elige una categoría.");
    try {
      await save.mutateAsync({
        id: editing?.id,
        type: kind,
        amount: value,
        currency,
        category_id: categoryId,
        transaction_date: date,
        description: description.trim() || null,
        notes: notes.trim() || null,
        payment_method: method,
        is_recurring: recurring,
        recurring_rule: recurring ? rule : null,
      });
      toast.success(
        editing ? "Movimiento actualizado" : kind === "income" ? "Ingreso guardado 🌱" : "Gasto guardado",
      );
      onOpenChange(false);
    } catch {
      toast.error("No pudimos guardar el movimiento. Inténtalo de nuevo.");
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle>
            {editing ? "Editar movimiento" : kind === "income" ? "Añadir ingreso" : "Añadir gasto"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-5 overflow-y-auto px-4 pb-6 safe-bottom">
          <div>
            <Label htmlFor="pw-amount" className="text-sm text-muted-foreground">
              ¿Cuánto {kind === "income" ? "recibiste" : "gastaste"}?
            </Label>
            <Input
              id="pw-amount"
              inputMode="decimal"
              autoFocus={!editing}
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 h-16 rounded-2xl text-center text-3xl font-semibold tabular-nums"
            />
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {formatMoney(value, currency)}
            </p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Categoría</Label>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {options.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={categoryId === c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    "flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-center transition-colors",
                    categoryId === c.id
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-card hover:bg-secondary",
                  )}
                >
                  <span className="text-xl" aria-hidden>
                    {c.emoji}
                  </span>
                  <span className="line-clamp-2 text-[11px] leading-tight">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pw-date" className="text-sm text-muted-foreground">
                Fecha
              </Label>
              <Input
                id="pw-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 h-12"
              />
              <div className="mt-2 flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setDate(isoDate(new Date()))}>
                  Hoy
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDate(isoDate(new Date(Date.now() - 86400000)))}
                >
                  Ayer
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1 !h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Método de pago</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="mt-1 !h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label} {m.value === "credit" ? "(Crédito)" : "(Débito)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!more ? (
            <Button variant="ghost" className="w-full" onClick={() => setMore(true)}>
              Añadir detalles opcionales
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pw-desc" className="text-sm text-muted-foreground">
                  Descripción
                </Label>
                <Input
                  id="pw-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={120}
                  className="mt-1 h-12"
                />
              </div>
              <div>
                <Label htmlFor="pw-notes" className="text-sm text-muted-foreground">
                  Notas
                </Label>
                <Textarea
                  id="pw-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Este movimiento se repite</p>
                  <p className="text-xs text-muted-foreground">Guarda la frecuencia para tus recurrentes.</p>
                </div>
                <Switch checked={recurring} onCheckedChange={setRecurring} aria-label="Movimiento recurrente" />
              </div>
              {recurring && (
                <Select value={rule} onValueChange={setRule}>
                  <SelectTrigger className="!h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Button
            className="h-14 w-full rounded-2xl text-base"
            disabled={save.isPending}
            onClick={handleSave}
          >
            {save.isPending ? "Guardando…" : editing ? "Guardar cambios" : "Guardar movimiento"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
