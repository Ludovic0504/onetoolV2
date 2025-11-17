import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/bibliotheque/supabase/client-navigateur";

type AuthCtx = {
  session: Session | null;
  loading: boolean;
  supabase: SupabaseClient;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const remember = useMemo(() => {
    try { return localStorage.getItem("onetool_oauth_remember") === "1"; }
    catch { return false; }
  }, []);


  const supabase = useMemo(() => getBrowserSupabase({ remember }), [remember]);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const init = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (!error) setSession(data.session ?? null);
      setLoading(false);

      if (!mountedRef.current) {
        const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
          setSession(s ?? null);
          setLoading(false);

          if (event === "SIGNED_IN") {
            try { localStorage.removeItem("onetool_oauth_remember"); } catch {}
          }
        });
        unsub = () => sub.subscription.unsubscribe();
        mountedRef.current = true;
      }
    };

    void init();
    return () => { if (unsub) unsub(); };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, [supabase]);

  const value = useMemo(
    () => ({ session, loading, supabase, signOut }),
    [session, loading, supabase, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
