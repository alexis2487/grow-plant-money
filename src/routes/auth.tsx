import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Wallet,
  CreditCard,
  Trophy,
  Smartphone,
  Eye,
  EyeOff,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FinancialPlant } from "@/components/FinancialPlant";
import { useAuth } from "@/lib/auth";
import { getLocalProfile } from "@/lib/localDb";
import {
  isBiometricAvailable,
  isBiometricEnabled,
  promptBiometricAuth,
} from "@/lib/native";
import { useRef } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "PlantWallet — Tu Guía Financiero Local" },
      {
        name: "description",
        content: "Configura tu acceso local y aprende a cuidar tu planta financiera de forma 100% privada y offline.",
      },
    ],
  }),
  component: LocalAuthPage,
});

function LocalAuthPage() {
  const navigate = useNavigate();
  const {
    isConfigured,
    isUnlocked,
    user,
    loading,
    securityQuestion,
    setupMaster,
    unlock,
    unlockWithBiometric,
    verifyAnswer,
    resetMasterPin,
  } = useAuth();

  // Biometría
  const [hasBiometric, setHasBiometric] = useState(false);
  const biometricAttemptedRef = useRef(false);

  const handleBiometricUnlock = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const success = await promptBiometricAuth("Desbloquea tu billetera");
      if (success) {
        unlockWithBiometric();
        const userName = user?.name || getLocalProfile().name;
        toast.success(userName ? `¡Bienvenido a PlantWallet, ${userName}! 🌱` : "¡Bienvenido a PlantWallet! 🌱");
        navigate({ to: "/inicio", replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isConfigured && !isUnlocked && isBiometricEnabled() && !biometricAttemptedRef.current) {
      biometricAttemptedRef.current = true;
      isBiometricAvailable().then((avail) => {
        if (avail) {
          setHasBiometric(true);
          promptBiometricAuth("Desbloquea tu billetera").then((success) => {
            if (success) {
              unlockWithBiometric();
              const userName = user?.name || getLocalProfile().name;
              toast.success(userName ? `¡Bienvenido a PlantWallet, ${userName}! 🌱` : "¡Bienvenido a PlantWallet! 🌱");
              navigate({ to: "/inicio", replace: true });
            }
          });
        }
      });
    } else if (isConfigured && !isUnlocked) {
      isBiometricAvailable().then((avail) => {
        if (avail && isBiometricEnabled()) {
          setHasBiometric(true);
        }
      });
    }
  }, [isConfigured, isUnlocked, navigate, unlockWithBiometric, user?.name]);

  // Si ya está configurado y desbloqueado, ir directo a inicio
  useEffect(() => {
    if (!loading && isConfigured && isUnlocked) {
      navigate({ to: "/inicio", replace: true });
    }
  }, [isConfigured, isUnlocked, loading, navigate]);

  // Estados del onboarding inicial (pasos 1 a 4)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [question, setQuestion] = useState("Nombre de tu primera mascota");
  const [answer, setAnswer] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Estados de la pantalla de bloqueo (usuario recurrente)
  const [inputPin, setInputPin] = useState("");
  const [showInputPin, setShowInputPin] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [busy, setBusy] = useState(false);

  // -------------------------------------------------------------
  // HANDLERS ONBOARDING
  // -------------------------------------------------------------
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Por favor, escribe tu nombre o cómo deseas que te llame.");
    }
    setOnboardingStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      return toast.error("Por favor, ingresa un PIN numérico.");
    }
    if (pin.length < 4) {
      return toast.error("El PIN debe tener al menos 4 números.");
    }
    if (pin !== confirmPin) {
      return toast.error("Los PIN ingresados no coinciden. Verifícalos.");
    }
    setOnboardingStep(3);
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      return toast.error("Escribe una pregunta de seguridad.");
    }
    if (!answer.trim()) {
      return toast.error("Escribe la respuesta secreta.");
    }
    setOnboardingStep(4);
  };

  const handleFinishOnboarding = async () => {
    setBusy(true);
    try {
      await setupMaster(name, pin, question, answer);
      toast.success(`¡Bienvenido a bordo, ${name.trim()}! 🌱`);
      navigate({ to: "/inicio", replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error al configurar tu cuenta local.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS BLOQUEO / RECUPERACIÓN
  // -------------------------------------------------------------
  const submitUnlock = async (pinCandidate: string, showToastOnFail = true) => {
    if (!pinCandidate.trim() || busy) return false;
    setBusy(true);
    try {
      const ok = await unlock(pinCandidate);
      if (ok) {
        const userName = user?.name || getLocalProfile().name;
        toast.success(userName ? `¡Bienvenido a PlantWallet, ${userName}! 🌱` : "¡Bienvenido a PlantWallet! 🌱");
        navigate({ to: "/inicio", replace: true });
        return true;
      } else if (showToastOnFail) {
        toast.error("PIN incorrecto. Inténtalo de nuevo.");
      }
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) return toast.error("Ingresa tu PIN.");
    await submitUnlock(inputPin, true);
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryAnswer.trim()) {
      return toast.error("Ingresa la respuesta a tu pregunta de seguridad.");
    }
    if (!newPin.trim()) {
      return toast.error("Ingresa tu nueva clave.");
    }
    if (newPin.length < 4) {
      return toast.error("La nueva clave debe tener al menos 4 caracteres.");
    }
    if (newPin !== confirmNewPin) {
      return toast.error("Las nuevas claves no coinciden.");
    }

    setBusy(true);
    try {
      const isCorrect = await verifyAnswer(recoveryAnswer);
      if (!isCorrect) {
        return toast.error("La respuesta de seguridad es incorrecta.");
      }

      await resetMasterPin(newPin);
      toast.success("¡Clave restablecida con éxito! Accediendo a tu jardín financiero...");
      navigate({ to: "/inicio", replace: true });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <FinancialPlant score={90} size={120} />
          <p className="mt-4 text-sm text-muted-foreground animate-pulse">Iniciando tu jardín financiero...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA 1: ONBOARDING INICIAL POR PRIMERA VEZ (LA PLANTA COMO GUÍA)
  // =========================================================================
  if (!isConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-between p-6 safe-top safe-bottom">
        {/* Barra superior de progreso */}
        <div className="w-full pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 font-medium">
            <span>Paso {onboardingStep} de 4</span>
            <span className="text-xs text-muted-foreground">PlantWallet</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(onboardingStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* CONTENIDO SEGÚN PASO */}
        <div className="my-auto py-6 space-y-6">
          {/* PASO 1: Saludo animado de la planta y Nombre */}
          {onboardingStep === 1 && (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="flex justify-center">
                <div className="relative">
                  <FinancialPlant score={100} size={170} />
                  <div className="absolute -top-1 -right-1 rounded-full bg-primary/20 p-2 text-primary animate-bounce">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Burbuja de diálogo de la planta */}
              <div className="relative rounded-3xl border border-primary/25 bg-card p-5 shadow-sm text-left">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rotate-45 border-l border-t border-primary/25 bg-card" />
                <p className="text-sm leading-relaxed text-foreground font-medium">
                  ¡Hola! Soy tu planta financiera 🌱. A partir de hoy creceré y floreceré con cada hábito de ahorro que registres.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Para empezar a conocernos, <strong>¿cómo te gustaría que te llame?</strong>
                </p>
              </div>

              <form onSubmit={handleStep1} className="space-y-4 text-left">
                <div>
                  <Label htmlFor="user-name" className="text-sm font-semibold">
                    Tu nombre o apodo
                  </Label>
                  <Input
                    id="user-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Alexis, Valentina, Alex..."
                    className="mt-1.5 h-13 rounded-2xl text-base px-4"
                    autoFocus
                    maxLength={30}
                  />
                </div>

                <Button type="submit" className="h-13 w-full rounded-2xl text-base font-semibold">
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          )}

          {/* PASO 2: Configurar Clave o PIN de seguridad */}
          {onboardingStep === 2 && (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="flex justify-center">
                <div className="relative">
                  <FinancialPlant score={90} size={150} />
                  <div className="absolute -bottom-1 right-2 rounded-full bg-secondary p-2 shadow-sm">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>

              {/* Burbuja de diálogo */}
              <div className="relative rounded-3xl border border-primary/25 bg-card p-5 shadow-sm text-left">
                <p className="text-sm leading-relaxed text-foreground font-medium">
                  Mucho gusto, <strong>{name}</strong>. Cuidemos tu privacidad 🔒.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Crea una <strong>clave o PIN de acceso</strong> para que nadie más pueda abrir tu aplicación en este dispositivo.
                </p>
              </div>

              <form onSubmit={handleStep2} className="space-y-4 text-left">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="master-pin" className="text-sm font-semibold">
                      PIN de seguridad (4 dígitos)
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{showPin ? "Ocultar" : "Mostrar"}</span>
                    </button>
                  </div>
                  <Input
                    id="master-pin"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="new-password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="••••"
                    className="mt-1.5 h-13 rounded-2xl text-center text-xl font-bold tracking-[0.3em]"
                    autoFocus
                    maxLength={8}
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-pin" className="text-sm font-semibold">
                    Confirma tu PIN
                  </Label>
                  <Input
                    id="confirm-pin"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="new-password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="••••"
                    className="mt-1.5 h-13 rounded-2xl text-center text-xl font-bold tracking-[0.3em]"
                    maxLength={8}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-13 rounded-2xl px-5"
                    onClick={() => setOnboardingStep(1)}
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="h-13 flex-1 rounded-2xl text-base font-semibold">
                    Siguiente paso <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* PASO 3: Pregunta de seguridad personalizada para recuperación */}
          {onboardingStep === 3 && (
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="flex justify-center">
                <div className="relative">
                  <FinancialPlant score={85} size={150} />
                  <div className="absolute -bottom-1 right-2 rounded-full bg-secondary p-2 shadow-sm">
                    <KeyRound className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* Burbuja de diálogo */}
              <div className="relative rounded-3xl border border-primary/25 bg-card p-5 shadow-sm text-left">
                <p className="text-sm leading-relaxed text-foreground font-medium">
                  Configura una <strong>pregunta de seguridad</strong> para tu tranquilidad.
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Si alguna vez olvidas tu clave, responderás esta pregunta para restablecerla al instante.
                </p>
              </div>

              <form onSubmit={handleStep3} className="space-y-4 text-left">
                <div>
                  <Label htmlFor="sec-question" className="text-sm font-semibold">
                    Tu pregunta de seguridad
                  </Label>
                  <Input
                    id="sec-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ej: Nombre de tu primera mascota"
                    className="mt-1.5 h-13 rounded-2xl text-sm px-4"
                    autoFocus
                    maxLength={70}
                  />
                </div>

                <div>
                  <Label htmlFor="sec-answer" className="text-sm font-semibold">
                    Respuesta secreta
                  </Label>
                  <Input
                    id="sec-answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Escribe la respuesta secreta (ej: Rocky)"
                    className="mt-1.5 h-13 rounded-2xl text-base px-4"
                    maxLength={50}
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    💡 La respuesta se almacena de forma segura y cifrada en tu dispositivo.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-13 rounded-2xl px-5"
                    onClick={() => setOnboardingStep(2)}
                  >
                    Atrás
                  </Button>
                  <Button type="submit" className="h-13 flex-1 rounded-2xl text-base font-semibold">
                    Guardar y ver funciones <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* PASO 4: Tour explicativo de funcionalidades principales */}
          {onboardingStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Todo listo, {name}
                </div>
                <h2 className="text-xl font-bold tracking-tight">Así funciona PlantWallet</h2>
                <p className="text-xs text-muted-foreground">
                  Estas son las principales herramientas que tienes a tu disposición:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                  <div className="rounded-xl bg-success/10 p-2.5 text-success shrink-0 mt-0.5">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">1. Tu Planta Financiera</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      Tu planta crece y florece según tu salud financiera real. Si ahorras y mantienes tus gastos en verde, prosperará.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500 shrink-0 mt-0.5">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">2. Débito y Crédito Independientes</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      Tus compras a crédito se registran por separado y no restan de tu saldo de débito, protegiendo tu liquidez.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                  <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500 shrink-0 mt-0.5">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">3. Retos y Colección</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      Cumple retos para ganar Growth Points y personalizar tu planta con skins exclusivas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  onClick={handleFinishOnboarding}
                  disabled={busy}
                  className="h-14 w-full rounded-2xl text-base font-semibold shadow-md"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" /> ¡Entrar a PlantWallet!
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pie de página discreto */}
        <p className="text-center text-[11px] text-muted-foreground pb-2">
          PlantWallet
        </p>
      </main>
    );
  }

  // =========================================================================
  // VISTA 2: PANTALLA DE BLOQUEO / RECUPERACIÓN (USUARIO YA CONFIGURADO)
  // =========================================================================
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-between p-6 safe-top safe-bottom">
      <div className="my-auto space-y-6 text-center">
        <div className="flex justify-center">
          <FinancialPlant score={92} size={160} />
        </div>

        {!isRecovering ? (
          // MODALIDAD: INGRESAR CLAVE DE DESBLOQUEO
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Hola de nuevo{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ingresa tu clave de acceso para ver tus finanzas.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="unlock-pin" className="text-sm font-semibold">
                    PIN de seguridad
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowInputPin(!showInputPin)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {showInputPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{showInputPin ? "Ocultar" : "Mostrar"}</span>
                  </button>
                </div>
                <Input
                  id="unlock-pin"
                  type={showInputPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="current-password"
                  value={inputPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setInputPin(val);
                    if (val.length === 4) {
                      submitUnlock(val, false);
                    }
                  }}
                  placeholder="••••"
                  className="mt-1.5 h-14 rounded-2xl text-center text-3xl font-bold tracking-[0.35em]"
                  autoFocus
                  maxLength={8}
                />
              </div>

              <Button type="submit" disabled={busy} className="h-13 w-full rounded-2xl text-base font-semibold">
                Desbloquear con PIN <Lock className="ml-2 h-4 w-4" />
              </Button>

              {hasBiometric && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBiometricUnlock}
                  disabled={busy}
                  className="h-13 w-full rounded-2xl border-primary/30 hover:border-primary text-primary font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Fingerprint className="h-5 w-5" /> Desbloquear con huella / rostro
                </Button>
              )}

              <div className="text-center pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setIsRecovering(true)}
                >
                  <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> ¿Olvidaste tu clave?
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // MODALIDAD: RECUPERAR CLAVE CON PREGUNTA DE SEGURIDAD
          <div className="space-y-5 text-left animate-in fade-in duration-300">
            <div className="text-center">
              <h2 className="text-xl font-bold">Recuperar acceso</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Responde tu pregunta de seguridad para crear una nueva clave.
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs">
              <p className="text-muted-foreground font-medium">Tu pregunta configurada:</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                ¿{securityQuestion || "Nombre de tu primera mascota"}?
              </p>
            </div>

            <form onSubmit={handleRecovery} className="space-y-4">
              <div>
                <Label htmlFor="rec-answer" className="text-sm font-semibold">
                  Tu respuesta secreta
                </Label>
                <Input
                  id="rec-answer"
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta"
                  className="mt-1.5 h-12 rounded-xl"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="new-pin" className="text-sm font-semibold">
                  Nuevo PIN (4 dígitos)
                </Label>
                <Input
                  id="new-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="new-password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="••••"
                  className="mt-1.5 h-12 rounded-xl text-center text-xl font-bold tracking-[0.3em]"
                  maxLength={8}
                />
              </div>

              <div>
                <Label htmlFor="confirm-new-pin" className="text-sm font-semibold">
                  Confirma tu nuevo PIN
                </Label>
                <Input
                  id="confirm-new-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="new-password"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="••••"
                  className="mt-1.5 h-12 rounded-xl text-center text-xl font-bold tracking-[0.3em]"
                  maxLength={8}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-12 rounded-xl px-4"
                  onClick={() => setIsRecovering(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy} className="h-12 flex-1 rounded-xl font-semibold">
                  Restablecer y entrar
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        PlantWallet
      </p>
    </main>
  );
}
