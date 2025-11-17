
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBrowserSupabase } from "@/bibliotheque/supabase/client-navigateur";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const url = window.location.href;
      console.log("[AuthCallback] start, url =", url);


      let remember = false;
      try {
        remember = localStorage.getItem("onetool_oauth_remember") === "1";
      } catch (e) {
        console.warn("[AuthCallback] cannot read remember flag:", e);
      }

      // Vérifier si les variables d'environnement sont configurées
      const urlEnv = import.meta.env.VITE_SUPABASE_URL;
      const keyEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!urlEnv || !keyEnv || urlEnv === 'https://placeholder.supabase.co' || keyEnv === 'placeholder-key') {
        console.error("[AuthCallback] Configuration Supabase manquante");
        navigate("/login?error=config", { replace: true });
        return;
      }

      const supabase = getBrowserSupabase({ remember });

      try {

        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        console.log("[AuthCallback] exchange result:", { data, error });
        
        if (error) {
          console.error("[AuthCallback] exchange error:", error);
          navigate("/login?error=exchange", { replace: true });
          return;
        }


        const { data: sessionData } = await supabase.auth.getSession();
        const hasSession = !!(sessionData?.session || data?.session);

        if (!hasSession) {
          console.error("[AuthCallback] no session after exchange, redirecting to /login");
          navigate("/login?error=callback", { replace: true });
          return;
        }


        let next = "/";
        try {
          const savedNext = localStorage.getItem("onetool_oauth_next");
          if (savedNext && savedNext.startsWith("/")) {
            next = savedNext;
          }
        } catch (e) {
          console.warn("[AuthCallback] cannot read next from storage:", e);
        }

        console.log("[AuthCallback] success, redirecting to", next);
        navigate(next, { replace: true });
      } catch (err) {
        console.error("[AuthCallback] unexpected error:", err);
        navigate("/login?error=callback", { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white"
      style={{ background: "#0C1116" }}
    >
      Validation en cours…
    </div>
  );
}
