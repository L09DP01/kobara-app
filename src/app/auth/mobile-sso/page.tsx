"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function MobileSSO() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleSSO = async () => {
      try {
        // Parse the hash parameters
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        
        // Parse regular query parameters for 'next'
        const urlParams = new URLSearchParams(window.location.search);
        const next = urlParams.get("next") || "/dashboard";

        if (access_token && refresh_token) {
          const supabase = createClient();
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error("SSO Error:", error);
            setError("Erreur d'authentification. Veuillez vous reconnecter.");
            // Redirect to login if failed
            setTimeout(() => router.replace("/login"), 3000);
          } else {
            // Success! Redirect to the destination
            router.replace(next);
          }
        } else {
          setError("Jeton d'authentification manquant.");
          setTimeout(() => router.replace("/login"), 3000);
        }
      } catch (err) {
        console.error("SSO Exception:", err);
        setError("Une erreur inattendue s'est produite.");
      }
    };

    handleSSO();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#020B14] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#FF4A1C] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-white text-xl font-bold mb-2">
          {error ? error : "Connexion sécurisée en cours..."}
        </h2>
        {!error && (
          <p className="text-[#AAB3C2]">
            Veuillez patienter pendant que nous vous authentifions.
          </p>
        )}
      </div>
    </div>
  );
}
