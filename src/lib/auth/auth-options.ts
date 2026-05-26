import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createAdminClient } from "@/utils/supabase/admin";
import bcrypt from "bcryptjs";
import { signSupabaseToken } from "@/lib/server/auth/supabase-jwt";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { authLimiter } from "@/lib/server/security/rate-limit";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        language: { label: "Language", type: "text" },
        passkey_response: { label: "Passkey Response", type: "text" }
      },
      async authorize(credentials, req) {
        const lang = credentials?.language || "fr";
        const email = credentials?.email?.toLowerCase().trim() || "";

        try {
          if (!credentials?.email) {
            throw new Error(lang === "en" ? "Please enter your email." : "Veuillez saisir votre e-mail.");
          }

          // HIGH-02: Rate limiting on login (by email to prevent brute force)
          const rateLimitKey = `login_${email}`;
          const { success: rlSuccess } = await authLimiter.limit(rateLimitKey);
          if (!rlSuccess) {
            throw new Error(lang === "en" 
              ? "Too many login attempts. Please try again in a few minutes." 
              : "Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.");
          }

          const supabase = createAdminClient();
          
          // Fetch user from public.users table
          const { data: user, error } = await supabase
            .from("users")
            .select("id, email, password_hash, email_verified")
            .eq("email", email)
            .maybeSingle();

          if (error || !user) {
            throw new Error(lang === "en" ? "No account exists with this email." : "Aucun compte n'existe avec cet e-mail.");
          }

          // Check if account is verified
          if (!user.email_verified) {
            throw new Error(lang === "en" ? "Your account is not verified yet." : "Votre compte n'est pas encore vérifié.");
          }

          // PASSKEY AUTHENTICATION
          if (credentials.passkey_response) {
            const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).maybeSingle();
            if (!merchant) throw new Error("Marchand introuvable.");

            const { data: settings } = await supabase.from('settings').select('security_json').eq('merchant_id', merchant.id).maybeSingle();
            const security = settings?.security_json || {};
            const expectedChallenge = security.auth_challenge;
            const challengeCreatedAt = security.auth_challenge_created_at;

            if (!expectedChallenge) throw new Error("Challenge invalide ou expiré.");

            // HIGH-03: Verify challenge expiration (5 minutes max)
            if (challengeCreatedAt) {
              const challengeAge = Date.now() - new Date(challengeCreatedAt).getTime();
              if (challengeAge > 5 * 60 * 1000) {
                // Clear expired challenge
                await supabase.from('settings').update({
                  security_json: { ...security, auth_challenge: null, auth_challenge_created_at: null }
                }).eq('merchant_id', merchant.id);
                throw new Error(lang === "en" ? "Challenge expired. Please try again." : "Challenge expiré. Veuillez réessayer.");
              }
            }

            const passkeys = security.passkeys || [];
            const responseBody = JSON.parse(credentials.passkey_response);
            
            const passkey = passkeys.find((pk: any) => pk.id === responseBody.id);
            if (!passkey) throw new Error("Clé biométrique introuvable.");

            const rpID = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'localhost';
            const origin = process.env.NEXT_PUBLIC_APP_URL || `http://${rpID}:3000`;

            const verification = await verifyAuthenticationResponse({
              response: responseBody,
              expectedChallenge,
              expectedOrigin: origin,
              expectedRPID: rpID,
              credential: {
                id: passkey.id,
                publicKey: Buffer.from(passkey.publicKey, 'base64url'),
                counter: passkey.counter,
                transports: passkey.transports,
              },
            });

            if (!verification.verified) {
              throw new Error("Authentification biométrique échouée.");
            }

            // Update counter and clear challenge (HIGH-03: always clear after use)
            passkey.counter = verification.authenticationInfo.newCounter;
            await supabase.from('settings').update({ 
              security_json: { ...security, passkeys, auth_challenge: null, auth_challenge_created_at: null }
            }).eq('merchant_id', merchant.id);

            // Audit Log: login success (passkey)
            const { logMerchantAudit } = await import("@/lib/server/security/audit");
            await logMerchantAudit(merchant.id, 'auth.login_success_passkey', { email: user.email });

            return { id: user.id, email: user.email, email_verified: user.email_verified };
          }

          // PASSWORD AUTHENTICATION
          if (!credentials.password) {
            throw new Error(lang === "en" ? "Password required." : "Mot de passe requis.");
          }

          const passwordMatches = await bcrypt.compare(credentials.password, user.password_hash);
          if (!passwordMatches) {
            throw new Error(lang === "en" ? "Incorrect password." : "Mot de passe incorrect.");
          }

          // Check if 2FA is required — fetch settings to determine method
          let twoFactorMethod = 'none';
          const { data: merchant } = await supabase.from('merchants').select('id').eq('user_id', user.id).maybeSingle();
          if (merchant) {
            const { data: settingsData } = await supabase.from('settings').select('security_json').eq('merchant_id', merchant.id).maybeSingle();
            twoFactorMethod = settingsData?.security_json?.two_factor_method || 'none';
          }

          // Audit Log: login success (credentials)
          const { logMerchantAudit } = await import("@/lib/server/security/audit");
          await logMerchantAudit(merchant?.id || null, 'auth.login_success', { email: user.email });

          return {
            id: user.id,
            email: user.email,
            email_verified: user.email_verified,
            two_factor_method: twoFactorMethod,
            two_factor_verified: false,
          };
        } catch (err: any) {
          // Audit Log: login failed
          try {
            const { logMerchantAudit } = await import("@/lib/server/security/audit");
            await logMerchantAudit(null, 'auth.login_failed', { email, error: err.message });
          } catch (e) {
            console.error("Failed to log auth failure:", e);
          }
          throw err;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // HIGH-01: Reduced from 30 days to 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.email_verified = user.email_verified;
        // CRIT-04: Store 2FA status in JWT (not in a manipulable cookie)
        token.two_factor_method = user.two_factor_method || 'none';
        token.two_factor_verified = user.two_factor_verified || false;
      }

      // CRIT-04: Allow updating 2FA status via session update trigger
      if (trigger === 'update' && session?.two_factor_verified !== undefined) {
        token.two_factor_verified = session.two_factor_verified;
      }
      
      // Always sign a fresh Supabase JWT if we have the user ID
      if (token.id) {
        try {
          token.supabaseAccessToken = signSupabaseToken(token.id, token.email);
        } catch (e) {
          console.error("Failed to sign Supabase JWT:", e);
        }
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          email_verified: token.email_verified
        };
        // Expose the Supabase JWT token to the session
        (session as any).supabaseAccessToken = token.supabaseAccessToken;
        // CRIT-04: Expose 2FA status in session
        (session as any).two_factor_method = token.two_factor_method;
        (session as any).two_factor_verified = token.two_factor_verified;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
};
