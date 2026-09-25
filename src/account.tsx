import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Progress } from "./types";
import type { Settings } from "./settings";

export interface CloudSnapshot {
  progress: Progress;
  settings: Settings;
  updatedAt: number;
}

interface AccountStore {
  state: "loading" | "guest" | "authenticated" | "offline";
  email: string | null;
  error: string | null;
  login: (email: string, password: string) => Promise<CloudSnapshot | null>;
  signup: (email: string, password: string) => Promise<CloudSnapshot | null>;
  logout: () => Promise<void>;
  pull: () => Promise<CloudSnapshot | null>;
  push: (progress: Progress, settings: Settings) => Promise<number | null>;
}

const AccountContext = createContext<AccountStore | null>(null);

async function request(action: string, body: Record<string, unknown> = {}) {
  const response = await fetch("/api/account", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Cloud sync request failed");
  return data;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccountStore["state"]>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void request("status").then((data) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
      setState(data.user ? "authenticated" : "guest");
    }).catch((reason) => {
      if (!active) return;
      setState(reason instanceof TypeError ? "offline" : "guest");
    });
    return () => { active = false; };
  }, []);

  const authenticate = useCallback(async (action: "login" | "signup", enteredEmail: string, password: string) => {
    setError(null);
    try {
      const data = await request(action, { email: enteredEmail, password });
      setEmail(data.user.email);
      setState("authenticated");
      return data.snapshot as CloudSnapshot | null;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not sign in";
      setError(message);
      throw reason;
    }
  }, []);

  const value = useMemo<AccountStore>(() => ({
    state,
    email,
    error,
    login: (enteredEmail, password) => authenticate("login", enteredEmail, password),
    signup: (enteredEmail, password) => authenticate("signup", enteredEmail, password),
    logout: async () => {
      await request("logout").catch(() => undefined);
      setEmail(null);
      setState("guest");
      setError(null);
    },
    pull: async () => {
      try {
        const data = await request("pull");
        setEmail(data.user.email);
        setState("authenticated");
        setError(null);
        return data.snapshot as CloudSnapshot | null;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not download progress");
        return null;
      }
    },
    push: async (progress, settings) => {
      try {
        const data = await request("sync", { progress, settings });
        setError(null);
        return Number(data.updatedAt) || Date.now();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not upload progress");
        return null;
      }
    },
  }), [authenticate, email, error, state]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountStore {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount used outside AccountProvider");
  return value;
}
