import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Home, Wallet, BarChart3, Trophy, Settings, Plus, Minus } from "lucide-react";
import { TransactionSheet } from "@/components/TransactionSheet";
import { useProfile } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { getLocalAuthConfig } from "@/lib/localDb";
import { registerBackHandler } from "@/lib/native";
import { refreshAndSyncWidgets } from "@/lib/widget";
import type { Transaction, TxType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const cfg = getLocalAuthConfig();
      if (!cfg.isConfigured) throw redirect({ to: "/auth" });
    }
  },
  component: AppShell,
});

interface SheetApi {
  open: (type: TxType, tx?: Transaction | null) => void;
}
const SheetContext = createContext<SheetApi>({ open: () => {} });
export const useTransactionSheet = () => useContext(SheetContext);

function AppShell() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { isConfigured, isUnlocked, loading } = useAuth();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState<TxType>("expense");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navItems = [
    { to: "/inicio", label: t("nav.home"), icon: Home },
    { to: "/movimientos", label: t("nav.transactions"), icon: Wallet },
    { to: "/reportes", label: t("nav.reports"), icon: BarChart3 },
    { to: "/retos", label: t("nav.challenges"), icon: Trophy },
    { to: "/ajustes", label: t("nav.settings"), icon: Settings },
  ];

  useEffect(() => {
    if (!loading && (!isConfigured || !isUnlocked)) {
      navigate({ to: "/auth", replace: true });
    }
  }, [isConfigured, isUnlocked, loading, navigate]);

  useEffect(() => {
    if (!fabOpen) return;
    return registerBackHandler(() => {
      setFabOpen(false);
      return true;
    });
  }, [fabOpen]);

  useEffect(() => {
    const theme = profile?.theme ?? "system";
    const dark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);

    if (typeof window !== "undefined") {
      import("@capacitor/status-bar")
        .then(({ StatusBar, Style }) => {
          StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {});
          StatusBar.setBackgroundColor({ color: dark ? "#141a16" : "#f7faf7" }).catch(() => {});
        })
        .catch(() => {});
    }
  }, [profile?.theme]);

  // Sincronizar widgets nativos y simulador al iniciar
  useEffect(() => {
    refreshAndSyncWidgets().catch(() => {});
  }, []);

  // Manejo de deep-links desde widgets (URLs como /inicio?quick=expense o /inicio?quick=income)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const quick = params.get("quick");
    if (quick === "expense" || quick === "income") {
      setSheetType(quick);
      setEditing(null);
      setSheetOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("quick");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  }, []);

  // Escuchar eventos de deep-linking nativos de Capacitor (appUrlOpen)
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    if (typeof window === "undefined") return;

    import("@capacitor/app")
      .then(({ App }) => {
        const handle = App.addListener("appUrlOpen", (event) => {
          try {
            const parsed = new URL(event.url);
            const path = parsed.pathname;
            const quick = parsed.searchParams.get("quick");

            if (path.includes("/movimientos")) {
              navigate({ to: "/movimientos" });
            } else if (path.includes("/retos")) {
              navigate({ to: "/retos" });
            } else if (path.includes("/ajustes")) {
              navigate({ to: "/ajustes" });
            } else if (path.includes("/inicio")) {
              navigate({ to: "/inicio" });
            }

            if (quick === "expense" || quick === "income") {
              setTimeout(() => {
                setSheetType(quick);
                setEditing(null);
                setSheetOpen(true);
              }, 120);
            }
          } catch (err) {
            console.warn("Error procesando appUrlOpen:", err);
          }
        });

        handle.then((sub) => {
          removeListener = () => sub.remove();
        });
      })
      .catch(() => {});

    return () => {
      removeListener?.();
    };
  }, [navigate]);

  const api: SheetApi = {
    open: (type, tx = null) => {
      setSheetType(type);
      setEditing(tx);
      setSheetOpen(true);
      setFabOpen(false);
    },
  };

  return (
    <SheetContext.Provider value={api}>
      <div className="min-h-screen md:flex">
        {/* Sidebar desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar p-5 md:flex">
          <div className="flex items-center gap-2 px-2">
            <span className="text-2xl" aria-hidden>
              🌱
            </span>
            <span className="text-lg font-bold">PlantWallet</span>
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === to
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
          <div className="space-y-2">
            <button
              onClick={() => api.open("income")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-3 text-sm font-medium"
            >
              <Plus className="h-4 w-4" aria-hidden /> {t("nav.addIncome")}
            </button>
            <button
              onClick={() => api.open("expense")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-medium text-primary-foreground"
            >
              <Minus className="h-4 w-4" aria-hidden /> {t("nav.addExpense")}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 flex flex-col min-h-screen">
          {/* Escudo protector sticky superior: evita que al hacer scroll el contenido choque o se entrelace con la hora, wifi, batería y cámara frontal */}
          <div
            className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur-md transition-colors md:hidden border-b border-border/20"
            style={{
              height: "max(env(safe-area-inset-top, 0px), 32px)",
            }}
            aria-hidden="true"
          />

          <main className="mx-auto w-full max-w-3xl px-4 pt-3 pb-32 md:pb-10 flex-1">
            <Outlet />
          </main>
        </div>

        {/* FAB móvil */}
        <div className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2 md:hidden">
          {fabOpen && (
            <>
              <button
                onClick={() => api.open("income")}
                className="animate-rise flex items-center gap-2 rounded-full bg-card px-4 py-3 text-sm font-medium shadow-lg"
              >
                <Plus className="h-4 w-4 text-success" aria-hidden /> {t("nav.addIncome")}
              </button>
              <button
                onClick={() => api.open("expense")}
                className="animate-rise flex items-center gap-2 rounded-full bg-card px-4 py-3 text-sm font-medium shadow-lg"
              >
                <Minus className="h-4 w-4 text-danger" aria-hidden /> {t("nav.addExpense")}
              </button>
            </>
          )}
          <button
            onClick={() => setFabOpen((v) => !v)}
            aria-label={t("nav.addMovement")}
            aria-expanded={fabOpen}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform active:scale-95"
          >
            <Plus
              className={cn("h-7 w-7 transition-transform", fabOpen && "rotate-45")}
              aria-hidden
            />
          </button>
        </div>

        {/* Navegación inferior móvil */}
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden">
          <ul className="grid grid-cols-5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium",
                    pathname === to ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <TransactionSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          type={sheetType}
          editing={editing}
        />
      </div>
    </SheetContext.Provider>
  );
}
