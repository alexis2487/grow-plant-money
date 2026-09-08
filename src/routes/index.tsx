import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/inicio", replace: true });
  }, [user, loading, navigate]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-8 px-6 py-14 text-center">
      <FinancialPlant score={95} size={200} />
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight">PlantWallet</h1>
        <p className="text-lg text-muted-foreground">Cultiva mejor tus finanzas.</p>
        <p className="text-sm text-muted-foreground">
          Registra tus ingresos y gastos en segundos, entiende tu salud financiera de un vistazo y
          haz crecer tu planta completando pequeños retos realistas.
        </p>
      </div>
      <div className="w-full space-y-3">
        <Button asChild className="h-14 w-full rounded-2xl text-base">
          <Link to="/auth">Crear mi cuenta</Link>
        </Button>
        <Button asChild variant="secondary" className="h-14 w-full rounded-2xl text-base">
          <Link to="/auth" search={{ mode: "login" }}>
            Ya tengo cuenta
          </Link>
        </Button>
      </div>
    </main>
  );
}
