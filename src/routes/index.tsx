import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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

  useEffect(() => {
    if (!loading) {
      if (isConfigured && isUnlocked) {
        navigate({ to: "/inicio", replace: true });
      } else {
        navigate({ to: "/auth", replace: true });
      }
    }
  }, [isConfigured, isUnlocked, loading, navigate]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <FinancialPlant score={95} size={160} />
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">PlantWallet</h1>
        <p className="text-sm text-muted-foreground animate-pulse">Cargando tu jardín financiero...</p>
      </div>
    </main>
  );
}
