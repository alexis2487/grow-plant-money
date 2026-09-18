import { Capacitor } from "@capacitor/core";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App } from "@capacitor/app";
import { toast } from "sonner";

const BIOMETRIC_STORAGE_KEY = "plantwallet_biometric_enabled";
const NOTIFICATIONS_STORAGE_KEY = "plantwallet_notifications_enabled";

// ============================================================================
// 1. BIOMETRÍA (HUELLA / FACE ID)
// ============================================================================

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const result = await NativeBiometric.isAvailable();
    return Boolean(result.isAvailable);
  } catch (err) {
    console.warn("Error comprobando biometría:", err);
    return false;
  }
}

export function isBiometricEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BIOMETRIC_STORAGE_KEY) === "true";
}

export function setBiometricEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem(BIOMETRIC_STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  }
}

export async function promptBiometricAuth(
  reason: string = "Accede a tus finanzas de forma segura"
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const avail = await isBiometricAvailable();
    if (!avail) return false;

    await NativeBiometric.verifyIdentity({
      title: "Desbloquear PlantWallet",
      subtitle: reason,
      description: "Confirma tu identidad con tu huella dactilar o reconocimiento facial",
      negativeButtonText: "Ingresar PIN",
      maxAttempts: 3,
    });
    return true;
  } catch (err) {
    // Usuario canceló o falló biometría
    return false;
  }
}

// ============================================================================
// 2. COMPARTIR ARCHIVOS NATIVAMENTE (RESPALDO JSON Y REPORTE CSV)
// ============================================================================

export async function shareFileNative(
  filename: string,
  content: string,
  title: string,
  text: string
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const fileResult = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title,
      text,
      url: fileResult.uri,
      dialogTitle: title,
    });
    return true;
  } catch (err) {
    console.warn("Error en compartir nativo:", err);
    return false;
  }
}

// ============================================================================
// 3. RECORDATORIOS Y NOTIFICACIONES LOCALES
// ============================================================================

export function isReminderNotificationEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) === "true";
}

export async function scheduleDailyReminder(hour: number = 20, minute: number = 0): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, "true");
    return true;
  }

  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") {
      return false;
    }

    // Cancelar recordatorios previos con id 101
    await LocalNotifications.cancel({ notifications: [{ id: 101 }] });

    // Programar notificación diaria repetitiva
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101,
          title: "🌱 ¿Tuviste algún gasto o ingreso hoy?",
          body: "Regístralo en PlantWallet para cuidar la salud de tu planta.",
          schedule: {
            on: {
              hour,
              minute,
            },
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: "ic_launcher_round",
          iconColor: "#16a34a",
        },
      ],
    });

    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, "true");
    return true;
  } catch (err) {
    console.warn("Error programando recordatorio:", err);
    return false;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 101 }] });
  } catch (err) {
    console.warn("Error cancelando recordatorio:", err);
  }
}

// ============================================================================
// 4. BOTÓN ATRÁS NATIVO Y GESTOS ANDROID
// ============================================================================

export type BackHandler = () => boolean;
const backHandlers: BackHandler[] = [];

export function registerBackHandler(handler: BackHandler): () => void {
  backHandlers.push(handler);
  return () => {
    const idx = backHandlers.lastIndexOf(handler);
    if (idx !== -1) {
      backHandlers.splice(idx, 1);
    }
  };
}

export function setupBackButtonListener(): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};

  let lastBackPress = 0;

  const listenerPromise = App.addListener("backButton", ({ canGoBack }) => {
    // 1. Ejecutar manejadores registrados (cajones/modales abiertos LIFO)
    for (let i = backHandlers.length - 1; i >= 0; i--) {
      const handler = backHandlers[i];
      if (handler()) {
        return; // Consumido por el modal/drawer
      }
    }

    // 2. Fallback por DOM: si hay algún drawer o diálogo abierto, cerrarlo con Escape
    const openDrawer = document.querySelector("[data-vaul-drawer][data-state='open']");
    const openDialog = document.querySelector("[role='dialog'][data-state='open']");
    if (openDrawer || openDialog) {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true,
        })
      );
      return;
    }

    // 3. Navegación hacia atrás si estamos en una pantalla secundaria
    const path = window.location.pathname;
    const isRoot = path === "/" || path === "/inicio" || path === "/auth";

    if (!isRoot && canGoBack) {
      window.history.back();
      return;
    }

    // 4. Doble toque para salir si estamos en la pantalla principal
    const now = Date.now();
    if (now - lastBackPress < 2000) {
      App.exitApp();
    } else {
      lastBackPress = now;
      toast.info("Presiona atrás nuevamente para salir");
    }
  });

  return () => {
    listenerPromise.then((sub) => sub.remove());
  };
}

