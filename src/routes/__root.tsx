import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "../lib/auth";
import { LanguageProvider } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { setupBackButtonListener } from "@/lib/native";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <span className="text-4xl">🌱</span>
        <h1 className="mt-4 text-xl font-semibold text-foreground">Esta página no existe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Puede que el enlace haya cambiado de lugar.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          No pudimos cargar esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo falló de nuestro lado. Puedes reintentar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "PlantWallet — Cultiva mejor tus finanzas" },
      {
        name: "description",
        content:
          "PlantWallet organiza tus ingresos y gastos, mide tu salud financiera y convierte tus buenos hábitos en el crecimiento de tu planta.",
      },
      { name: "theme-color", content: "#f7faf7" },
      { property: "og:title", content: "PlantWallet — Cultiva mejor tus finanzas" },
      {
        property: "og:description",
        content: "Finanzas personales simples, visuales y motivadoras.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    try {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      return () => data?.subscription?.unsubscribe();
    } catch {
      // Modo local/offline: Supabase no está configurado
    }
  }, [router, queryClient]);

  // Suprime activamente del DOM cualquier marca de agua inyectada en tiempo de ejecución
  useEffect(() => {
    if (typeof window === "undefined") return;

    const purgeWatermarks = () => {
      const selectors = [
        "#lovable-badge",
        "[id*='lovable-badge']",
        "[class*='lovable-badge']",
        "[id*='lovable']",
        "[class*='lovable']",
        "a[href*='lovable.dev']",
        "a[href*='lovable.app']",
        "iframe[src*='lovable']",
        ".lovable-badge",
        "#lovable-watermark",
        "[data-lovable-badge]",
        "[data-lovable-watermark]",
      ];
      selectors.forEach((sel) => {
        try {
          document.querySelectorAll(sel).forEach((el) => {
            el.remove();
          });
        } catch {
          // Ignorar selectores no válidos
        }
      });
    };

    purgeWatermarks();
    const observer = new MutationObserver(() => {
      purgeWatermarks();
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });

    const cleanupBack = setupBackButtonListener();

    return () => {
      observer.disconnect();
      cleanupBack();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
