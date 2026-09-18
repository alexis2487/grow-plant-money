import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Restablecer contraseña — PlantWallet" },
      {
        name: "description",
        content: "Define una nueva contraseña para tu cuenta de PlantWallet.",
      },
      { property: "og:title", content: "Restablecer contraseña — PlantWallet" },
      { property: "og:description", content: "Define una nueva contraseña para tu cuenta." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("La contraseña debe tener al menos 8 caracteres.");
    if (password !== confirm) return toast.error("Las contraseñas no coinciden.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error("No pudimos actualizar tu contraseña. Pide un nuevo enlace.");
    toast.success("Contraseña actualizada 🌱");
    navigate({ to: "/inicio", replace: true });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <form onSubmit={submit} className="surface space-y-4 p-6">
        <h1 className="text-xl font-semibold">Nueva contraseña</h1>
        <div>
          <Label htmlFor="np">Contraseña</Label>
          <Input
            id="np"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-12"
          />
        </div>
        <div>
          <Label htmlFor="nc">Confirmar contraseña</Label>
          <Input
            id="nc"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 h-12"
          />
        </div>
        <Button type="submit" className="h-13 w-full rounded-2xl py-3.5" disabled={busy}>
          Guardar contraseña
        </Button>
      </form>
    </main>
  );
}
