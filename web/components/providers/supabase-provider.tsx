"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { SessionProfile } from "@/lib/auth/session";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getSessionProfile } from "@/lib/auth/session";

type Ctx = {
  client: SupabaseClient | null;
  session: Session | null;
  profile: SessionProfile | null;
  refreshSession: () => Promise<void>;
};

const SupabaseContext = createContext<Ctx | undefined>(undefined);

function tryCreateBrowserClient(): SupabaseClient | null {
  try {
    return createBrowserSupabaseClient();
  } catch {
    return null;
  }
}

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => tryCreateBrowserClient(), []);

  const [session, setSession] = useState<Session | null>(null);

  const refreshSession = useCallback(async () => {
    if (!client) return;
    const {
      data: { session: s },
    } = await client.auth.getSession();
    setSession(s);
  }, [client]);

  useEffect(() => {
    void refreshSession();
    if (!client) return undefined;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
    });
    return () => subscription.unsubscribe();
  }, [client, refreshSession]);

  const profile = getSessionProfile(session?.user ?? null);

  const value = useMemo<Ctx>(
    () => ({
      client,
      session,
      profile,
      refreshSession,
    }),
    [client, session, profile, refreshSession]
  );

  return (
    <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
  );
}

export function useSupabaseContext(): Ctx {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("SupabaseProvider dışında useSupabaseContext kullanılamaz.");
  }
  return ctx;
}
