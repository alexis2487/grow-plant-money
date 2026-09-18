import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getLocalAuthConfig,
  setupLocalAuth,
  verifyLocalPin,
  verifyLocalSecurityAnswer,
  resetLocalPin,
  initLocalDatabase,
  getLocalProfile,
} from "./localDb";

export interface LocalUser {
  id: string;
  name: string;
}

interface AuthValue {
  isConfigured: boolean;
  isUnlocked: boolean;
  user: LocalUser | null;
  loading: boolean;
  securityQuestion: string;
  setupMaster: (name: string, pin: string, question: string, answer: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  verifyAnswer: (answer: string) => Promise<boolean>;
  resetMasterPin: (newPin: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue>({
  isConfigured: false,
  isUnlocked: false,
  user: null,
  loading: true,
  securityQuestion: "",
  setupMaster: async () => {},
  unlock: async () => false,
  lock: () => {},
  verifyAnswer: async () => false,
  resetMasterPin: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializar y verificar estado de autenticación local
    initLocalDatabase();
    const cfg = getLocalAuthConfig();
    setIsConfigured(cfg.isConfigured);
    setSecurityQuestion(cfg.securityQuestion);

    if (cfg.isConfigured) {
      const profile = getLocalProfile();
      setUser({ id: "local_user", name: profile.name || cfg.name || "Jardinero" });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  const setupMaster = async (name: string, pin: string, question: string, answer: string) => {
    await setupLocalAuth(name, pin, question, answer);
    setIsConfigured(true);
    setIsUnlocked(true);
    setUser({ id: "local_user", name: name.trim() });
    setSecurityQuestion(question.trim());
  };

  const unlock = async (pin: string): Promise<boolean> => {
    const valid = await verifyLocalPin(pin);
    if (valid) {
      setIsUnlocked(true);
      const profile = getLocalProfile();
      setUser({ id: "local_user", name: profile.name || "Jardinero" });
      return true;
    }
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
  };

  const verifyAnswer = async (answer: string): Promise<boolean> => {
    return await verifyLocalSecurityAnswer(answer);
  };

  const resetMasterPin = async (newPin: string): Promise<void> => {
    await resetLocalPin(newPin);
    setIsUnlocked(true);
  };

  const signOut = () => {
    setIsUnlocked(false);
  };

  const value = useMemo(
    () => ({
      isConfigured,
      isUnlocked,
      user,
      loading,
      securityQuestion,
      setupMaster,
      unlock,
      lock,
      verifyAnswer,
      resetMasterPin,
      signOut,
    }),
    [isConfigured, isUnlocked, user, loading, securityQuestion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
