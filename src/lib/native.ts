import { Capacitor } from "@capacitor/core";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { LocalNotifications } from "@capacitor/local-notifications";

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
