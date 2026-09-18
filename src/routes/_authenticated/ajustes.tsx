import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Fingerprint, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WidgetConfigSection } from "@/components/WidgetConfigSection";
import {
  useCategories,
  useProfile,
  useRestoreDefaultCategories,
  useSaveCategory,
  useTransactions,
  useUpdateProfile,
} from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { exportLocalBackupJson, importLocalBackupJson, verifyLocalPin } from "@/lib/localDb";
import {
  isBiometricAvailable,
  isBiometricEnabled,
  setBiometricEnabled,
  promptBiometricAuth,
  isReminderNotificationEnabled,
  scheduleDailyReminder,
  cancelDailyReminder,
  shareFileNative,
} from "@/lib/native";
import { CURRENCIES, paymentLabel } from "@/lib/format";
import { useTranslation, type SupportedLanguage } from "@/i18n";

export const Route = createFileRoute("/_authenticated/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes — PlantWallet" },
      {
        name: "description",
        content: "Configura tu perfil, moneda, idioma, tema, categorías, presupuestos y seguridad.",
      },
      { property: "og:title", content: "Ajustes — PlantWallet" },
      { property: "og:description", content: "Personaliza PlantWallet a tu medida." },
    ],
  }),
  component: Ajustes,
});

const EMOJIS = ["🍔", "🚌", "🏠", "💡", "🎬", "🛍️", "💊", "📚", "🎁", "✈️", "🐶", "💼", "💰", "🌱"];

function Ajustes() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { t, language, setLanguage, supportedLanguages } = useTranslation();

  // Sincronizar idioma con el perfil guardado si difiere
  useEffect(() => {
    if (
      profile?.language &&
      profile.language !== language &&
      (profile.language === "es" || profile.language === "en")
    ) {
      setLanguage(profile.language as SupportedLanguage);
    }
  }, [profile?.language, language, setLanguage]);

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </header>

      <section className="surface space-y-4 p-4">
        <h2 className="text-base font-semibold">{t("settings.profileSection")}</h2>
        <div>
          <Label htmlFor="name">{t("settings.name")}</Label>
          <Input
            id="name"
            defaultValue={profile?.name ?? ""}
            placeholder={t("settings.namePlaceholder")}
            className="mt-1 h-12"
            maxLength={60}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== profile?.name) {
                updateProfile.mutate({ name: v });
                toast.success(t("settings.nameUpdated"));
              }
            }}
          />
        </div>
        <div>
          <Label>{t("settings.primaryCurrency")}</Label>
          <Select
            value={profile?.base_currency ?? "COP"}
            onValueChange={(v) => {
              updateProfile.mutate({ base_currency: v });
              toast.success(t("settings.currencyUpdated"));
            }}
          >
            <SelectTrigger className="mt-1 !h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sección de Selección de Idioma / Internationalization */}
        <div>
          <Label className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-primary" /> {t("settings.language")}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            {t("settings.languageSubtitle")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    if (lang.code !== language) {
                      setLanguage(lang.code);
                      updateProfile.mutate({ language: lang.code });
                      toast.success(t("settings.languageChanged"));
                    }
                  }}
                  className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:bg-accent/50"
                  }`}
                >
                  <span className="text-lg" aria-hidden>
                    {lang.flag}
                  </span>
                  <span>{lang.nativeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label>{t("settings.appearance")}</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(
              [
                ["light", t("settings.themeLight")],
                ["dark", t("settings.themeDark")],
                ["system", t("settings.themeSystem")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => updateProfile.mutate({ theme: value })}
                className={`min-h-[48px] rounded-xl border text-sm font-medium transition-colors ${
                  (profile?.theme ?? "system") === value
                    ? "border-primary bg-accent"
                    : "border-border bg-card"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label htmlFor="notif">{t("settings.alertsAndReminders")}</Label>
            <p className="text-xs text-muted-foreground">{t("settings.alertsDescription")}</p>
          </div>
          <Switch
            id="notif"
            checked={profile?.notifications_enabled ?? true}
            onCheckedChange={(v) => updateProfile.mutate({ notifications_enabled: v })}
          />
        </div>
      </section>

      <WidgetConfigSection />

      <CategoriesSection emojis={EMOJIS} />
      <NotificationsSection />
      <SecuritySection />
      <DataSection />

      <p className="px-1 text-center text-xs text-muted-foreground">{t("settings.disclaimer")}</p>
    </div>
  );
}

function CategoriesSection({ emojis }: { emojis: string[] }) {
  const { data: categories = [] } = useCategories();
  const save = useSaveCategory();
  const restore = useRestoreDefaultCategories();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌱");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [essential, setEssential] = useState(false);

  return (
    <section className="surface p-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="cat" className="border-0">
          <AccordionTrigger className="py-0 text-base font-semibold hover:no-underline">
            {t("settings.categoriesCount", {
              count: categories.filter((c) => c.is_active).length,
            })}
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">{t("settings.categoriesEmpty")}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled={restore.isPending}
                  onClick={async () => {
                    await restore.mutateAsync();
                    toast.success(t("settings.restoreCategoriesSuccess"));
                  }}
                >
                  {t("settings.restoreCategories")}
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li
                    key={c.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden>{c.emoji}</span>
                      <span className="truncate text-sm font-medium">{c.name}</span>
                      {c.is_essential && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {t("common.essential")}
                        </Badge>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {c.type === "income" ? t("common.income") : t("common.expense")}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`${c.is_active ? t("common.delete") : t("common.retry")} ${c.name}`}
                        onClick={() => {
                          save.mutate({ id: c.id, is_active: !c.is_active });
                          toast.success(
                            c.is_active
                              ? t("settings.categoryArchived")
                              : t("settings.categoryRestored"),
                          );
                        }}
                      >
                        <Trash2
                          className={`h-4 w-4 ${c.is_active ? "" : "opacity-40"}`}
                          aria-hidden
                        />
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 space-y-3 rounded-xl bg-muted/50 p-3">
              <p className="text-sm font-medium">{t("settings.newCategory")}</p>
              <div className="flex flex-wrap gap-1.5">
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    aria-label={`Elegir ${e}`}
                    className={`h-10 w-10 rounded-xl border text-lg ${
                      emoji === e ? "border-primary bg-accent" : "border-border bg-card"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("settings.categoryNamePlaceholder")}
                className="h-12"
                maxLength={40}
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={type} onValueChange={(v) => setType(v as "expense" | "income")}>
                  <SelectTrigger className="!h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">{t("common.expense")}</SelectItem>
                    <SelectItem value="income">{t("common.income")}</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex min-h-[48px] items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 text-sm">
                  {t("common.essential")}
                  <Switch checked={essential} onCheckedChange={setEssential} />
                </label>
              </div>
              <Button
                className="h-12 w-full rounded-xl"
                onClick={async () => {
                  if (!name.trim()) return toast.error(t("settings.categoryNameRequired"));
                  await save.mutateAsync({
                    name: name.trim(),
                    emoji,
                    type,
                    is_essential: essential,
                    is_active: true,
                    color: "#3f9d74",
                  });
                  setName("");
                  toast.success(t("settings.categoryCreated"));
                }}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden /> {t("settings.createCategory")}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function NotificationsSection() {
  const { t } = useTranslation();
  const [reminderEnabled, setReminderEnabled] = useState(isReminderNotificationEnabled());

  const handleToggleReminder = async (checked: boolean) => {
    if (checked) {
      const success = await scheduleDailyReminder(20, 0);
      if (success) {
        setReminderEnabled(true);
        toast.success(t("settings.reminderScheduled"));
      } else {
        toast.error(t("settings.reminderPermError"));
      }
    } else {
      await cancelDailyReminder();
      setReminderEnabled(false);
      toast.success(t("settings.reminderDisabled"));
    }
  };

  return (
    <section className="surface p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Label className="flex items-center gap-1.5 text-base font-semibold">
            <Bell className="h-4 w-4 text-primary" /> {t("settings.dailyReminder")}
          </Label>
          <p className="text-xs text-muted-foreground">{t("settings.dailyReminderDesc")}</p>
        </div>
        <Switch checked={reminderEnabled} onCheckedChange={handleToggleReminder} />
      </div>
    </section>
  );
}

function SecuritySection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lock, resetMasterPin, securityQuestion } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(isBiometricEnabled());

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
  }, []);

  const handleToggleBiometric = async (checked: boolean) => {
    if (checked) {
      const avail = await isBiometricAvailable();
      if (!avail) {
        return toast.error(t("settings.biometricNotRegistered"));
      }
      const ok = await promptBiometricAuth(t("settings.biometricPrompt"));
      if (ok) {
        setBiometricEnabled(true);
        setBioEnabled(true);
        toast.success(t("settings.biometricEnabled"));
      } else {
        toast.error(t("settings.biometricError"));
      }
    } else {
      setBiometricEnabled(false);
      setBioEnabled(false);
      toast.success(t("settings.biometricDisabled"));
    }
  };

  return (
    <section className="surface p-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="sec" className="border-0">
          <AccordionTrigger className="py-0 text-base font-semibold hover:no-underline">
            {t("settings.securitySection")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-1.5 text-sm font-semibold">
                  <Fingerprint className="h-4 w-4 text-primary" /> {t("settings.biometricTitle")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {bioAvailable
                    ? t("settings.biometricDescAvailable")
                    : t("settings.biometricDescUnavailable")}
                </p>
              </div>
              <Switch
                checked={bioEnabled}
                disabled={!bioAvailable}
                onCheckedChange={handleToggleBiometric}
              />
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <span>{t("settings.securityQuestionLabel")} </span>
              <strong className="text-foreground">
                ¿{securityQuestion || t("settings.defaultQuestion")}?
              </strong>
            </div>

            <div>
              <Label htmlFor="cp">{t("settings.currentPin")}</Label>
              <Input
                id="cp"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={current}
                onChange={(e) => setCurrent(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder={t("settings.currentPinPlaceholder")}
                className="mt-1 h-12 text-center text-lg font-bold tracking-widest"
                maxLength={8}
              />
            </div>
            <div>
              <Label htmlFor="np">{t("settings.newPin")}</Label>
              <Input
                id="np"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={next}
                onChange={(e) => setNext(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder={t("settings.newPinPlaceholder")}
                className="mt-1 h-12 text-center text-lg font-bold tracking-widest"
                maxLength={8}
              />
            </div>
            <Button
              variant="secondary"
              className="h-12 w-full rounded-xl font-medium"
              disabled={busy}
              onClick={async () => {
                if (!current.trim()) return toast.error(t("settings.pinRequired"));
                if (next.length < 4) return toast.error(t("settings.pinMinLength"));
                setBusy(true);
                const valid = await verifyLocalPin(current);
                if (!valid) {
                  setBusy(false);
                  return toast.error(t("settings.pinIncorrect"));
                }
                await resetMasterPin(next);
                setBusy(false);
                setCurrent("");
                setNext("");
                toast.success(t("settings.pinUpdatedSuccess"));
              }}
            >
              {t("settings.changePinButton")}
            </Button>

            <Button
              variant="destructive"
              className="h-12 w-full rounded-xl font-medium"
              onClick={() => {
                lock();
                navigate({ to: "/auth", replace: true });
                toast.info(t("settings.appLockedInfo"));
              }}
            >
              {t("settings.lockAppNow")}
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function DataSection() {
  const { data: txs = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { t } = useTranslation();
  const qc = useQueryClient();

  async function exportBackup() {
    const json = exportLocalBackupJson();
    const fileName = `plantwallet_backup_${new Date().toISOString().slice(0, 10)}.json`;
    await shareFileNative(
      fileName,
      json,
      "Copia de seguridad PlantWallet",
      "Respaldo seguro de finanzas personales en PlantWallet 🌱",
    );
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const ok = importLocalBackupJson(text);
      if (ok) {
        await qc.invalidateQueries();
        toast.success(t("settings.backupRestored"));
      } else {
        toast.error(t("settings.backupInvalid"));
      }
    };
    reader.readAsText(file);
  }

  async function exportCsv() {
    const rows = [
      ["fecha", "tipo", "categoria", "descripcion", "importe", "moneda", "metodo_pago", "notas"],
      ...txs.map((t) => [
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
    const fileName = `plantwallet_movimientos_${new Date().toISOString().slice(0, 10)}.csv`;
    await shareFileNative(
      fileName,
      `\uFEFF${csv}`,
      "Movimientos PlantWallet",
      "Reporte de transacciones de PlantWallet 🌱",
    );
  }

  return (
    <section className="surface space-y-3.5 p-4">
      <h2 className="text-base font-semibold">{t("settings.backupTitle")}</h2>
      <p className="text-xs text-muted-foreground leading-relaxed">{t("settings.backupDesc")}</p>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Button
          variant="outline"
          className="h-12 rounded-xl text-xs font-semibold"
          onClick={exportBackup}
        >
          {t("settings.exportJson")}
        </Button>

        <label className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-input bg-background px-4 text-xs font-semibold hover:bg-accent hover:text-accent-foreground">
          {t("settings.importJson")}
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>

      <Button
        variant="secondary"
        className="h-12 w-full rounded-xl text-xs font-medium"
        onClick={exportCsv}
      >
        {t("settings.exportCsv")}
      </Button>
    </section>
  );
}
