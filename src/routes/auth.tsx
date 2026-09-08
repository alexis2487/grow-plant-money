import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinancialPlant } from "@/components/FinancialPlant";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "login" ? "login" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar a PlantWallet" },
      { name: "description", content: "Crea tu cuenta o inicia sesión para administrar tus finanzas en PlantWallet." },
      { property: "og:title", content: "Entrar a PlantWallet" },
      { property: "og:description", content: "Accede a tus finanzas personales en PlantWallet." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Escribe un correo válido").max(255);
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72)
  .regex(/[a-zA-Z]/, "Incluye al menos una letra")
  .regex(/[0-9]/, "Incluye al menos un número");

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup" | "recover">(
    search.mode === "login" ? "login" : "signup",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/inicio", replace: true });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const mail = emailSchema.parse(email);
      if (tab === "recover") {
        const { error } = await supabase.auth.resetPasswordForEmail(mail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Te enviamos un correo para restablecer tu contraseña.");
        setTab("login");
        return;
      }
      if (tab === "signup") {
        passwordSchema.parse(password);
        if (password !== confirm) throw new Error("Las contraseñas no coinciden");
        if (!name.trim()) throw new Error("Escribe tu nombre");
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name.trim() },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Revisa tu correo para confirmar tu cuenta.");
          setTab("login");
        }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(translate(msg));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("No pudimos conectar con Google.");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div className="flex flex-col items-center text-center">
        <FinancialPlant score={88} size={120} />
        <h1 className="mt-2 text-2xl font-bold">PlantWallet</h1>
        <p className="text-sm text-muted-foreground">Cultiva mejor tus finanzas.</p>
      </div>

      <div className="surface p-5">
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
          {(["signup", "login"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`h-10 rounded-full text-sm font-medium transition-colors ${
                tab === t ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t === "signup" ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-12" maxLength={60} />
            </div>
          )}
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-12"
            />
          </div>
          {tab !== "recover" && (
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-12"
              />
            </div>
          )}
          {tab === "signup" && (
            <div>
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 h-12"
              />
            </div>
          )}

          <Button type="submit" className="h-13 w-full rounded-2xl py-3.5 text-base" disabled={busy}>
            {busy
              ? "Un momento…"
              : tab === "signup"
                ? "Crear cuenta"
                : tab === "login"
                  ? "Entrar"
                  : "Enviar correo de recuperación"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="secondary" className="h-12 w-full rounded-2xl" onClick={handleGoogle}>
          Continuar con Google
        </Button>

        <button
          type="button"
          onClick={() => setTab(tab === "recover" ? "login" : "recover")}
          className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {tab === "recover" ? "Volver a iniciar sesión" : "¿Olvidaste tu contraseña?"}
        </button>
      </div>
    </main>
  );
}

function translate(msg: string) {
  if (/Invalid login credentials/i.test(msg)) return "Correo o contraseña incorrectos.";
  if (/already registered/i.test(msg)) return "Ese correo ya tiene una cuenta.";
  if (/Email not confirmed/i.test(msg)) return "Confirma tu correo antes de entrar.";
  return msg;
}
