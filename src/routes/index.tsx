import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FinancialPlant } from "@/components/FinancialPlant";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlantWallet — Cultiva mejor tus finanzas" },
      {
        name: "description",
        content:
          "Registra ingresos y gastos en segundos, entiende tu salud financiera y mejora tus hábitos con retos personalizados.",
      },
      { property: "og:title", content: "PlantWallet — Cultiva mejor tus finanzas" },
      {
        property: "og:description",
        content: "Finanzas personales simples, visuales y motivadoras, pensadas para el móvil.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { isConfigured, isUnlocked, loading } = useAuth();
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Si todavía está leyendo el estado inicial, esperar
    if (loading) return;

    // Mantener la animación de la planta durante 2.2 segundos para una experiencia visual agradable y fluida
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (isConfigured && isUnlocked) {
          navigate({ to: "/inicio", replace: true });
        } else {
          navigate({ to: "/auth", replace: true });
        }
      }, 350);
    }, 2200);

    return () => clearTimeout(timer);
  }, [isConfigured, isUnlocked, loading, navigate]);

  return (
    <main
      className={`mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center transition-all duration-350 ${
        fading ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse" />
        <div className="relative animate-in zoom-in-95 duration-500">
          <FinancialPlant score={98} size={180} />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
          PlantWallet
        </h1>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Cultivando tu salud financiera...
        </p>
        <div className="mx-auto h-1 w-28 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-full bg-primary animate-pulse" />
        </div>
      </div>
    </main>
  );
}
