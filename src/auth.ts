import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase/admin"
import bcrypt from "bcryptjs"
import { signSupabaseToken } from "@/lib/server/auth/supabase-jwt"
import { verifyAuthenticationResponse } from "@simplewebauthn/server"

const isProduction = process.env.NODE_ENV === "production"
const cookieDomain = isProduction ? ".kobara.app" : undefined

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        language: { label: "Language", type: "text" },
        passkey_response: { label: "Passkey Response", type: "text" },
        otp: { label: "OTP Code", type: "text" }
      },
      authorize: async (credentials) => {
        const lang = (credentials?.language as string) || "fr"

        if (!credentials?.email) {
          throw new Error(lang === "en" ? "Please enter your email." : "Veuillez saisir votre e-mail.")
        }

        const email = (credentials.email as string).toLowerCase().trim()

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("id, email, password_hash, role, is_active, email_verified")
          .eq("email", email)
          .single()

        if (error || !user) {
          throw new Error(lang === "en" ? "No account exists with this email." : "Aucun compte n'existe avec cet e-mail.")
        }

        if (user.is_active === false) {
          throw new Error("Compte désactivé.")
        }

        if (!user.email_verified) {
          throw new Error(lang === "en" ? "Your account is not verified yet." : "Votre compte n'est pas encore vérifié.")
        }

        // PASSKEY AUTHENTICATION
        if (credentials.passkey_response) {
          const { data: merchant } = await supabaseAdmin.from('merchants').select('id').eq('user_id', user.id).maybeSingle();
          if (!merchant) throw new Error("Marchand introuvable.");

          const { data: settings } = await supabaseAdmin.from('settings').select('security_json').eq('merchant_id', merchant.id).maybeSingle();
          const security = settings?.security_json || {};
          const expectedChallenge = security.auth_challenge;

          if (!expectedChallenge) throw new Error("Challenge invalide ou expiré.");

          const passkeys = security.passkeys || [];
          const responseBody = JSON.parse(credentials.passkey_response as string);
          
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

          passkey.counter = verification.authenticationInfo.newCounter;
          await supabaseAdmin.from('settings').update({ 
            security_json: { ...security, passkeys, auth_challenge: null }
          }).eq('merchant_id', merchant.id);

          return { id: user.id, email: user.email, email_verified: user.email_verified, role: user.role }
        }

        // PASSWORD AUTHENTICATION
        if (!credentials.password) {
          throw new Error(lang === "en" ? "Password required." : "Mot de passe requis.")
        }

        const isValidPassword = await bcrypt.compare(credentials.password as string, user.password_hash)

        if (!isValidPassword) {
          throw new Error(lang === "en" ? "Incorrect password." : "Mot de passe incorrect.")
        }

        // 2FA VERIFICATION
        let requires2FA = false;

        const { data: ownedMerchants } = await supabaseAdmin.from('merchants').select('id').eq('user_id', user.id);
        if (ownedMerchants && ownedMerchants.length > 0) {
          for (const m of ownedMerchants) {
            const { data: mSet } = await supabaseAdmin.from('settings').select('security_json').eq('merchant_id', m.id).maybeSingle();
            if (mSet?.security_json?.['2fa_enabled']) requires2FA = true;
          }
        }

        const { data: memberships } = await supabaseAdmin.from('merchant_members').select('merchant_id').eq('user_id', user.id).eq('status', 'active');
        if (memberships && memberships.length > 0) {
          for (const mem of memberships) {
            const { data: mSet } = await supabaseAdmin.from('settings').select('security_json').eq('merchant_id', mem.merchant_id).maybeSingle();
            if (mSet?.security_json?.['2fa_enabled']) requires2FA = true;
          }
        }

        if (requires2FA) {
           if (credentials.otp) {
              const { Redis } = await import('@upstash/redis');
              const redis = Redis.fromEnv();
              const storedOtp = await redis.get(`otp:${user.email}`);
              if (!storedOtp || String(storedOtp) !== (credentials.otp as string)) {
                 throw new Error("Code de sécurité incorrect ou expiré.");
              }
              await redis.del(`otp:${user.email}`);
           } else {
              const { Redis } = await import('@upstash/redis');
              const redis = Redis.fromEnv();
              const otp = Math.floor(100000 + Math.random() * 900000).toString();
              await redis.set(`otp:${user.email}`, otp, { ex: 600 });
              
              const { sendEmail } = await import('@/lib/server/mail');
              await sendEmail({
                to: user.email,
                subject: "Connexion - Code de vérification",
                text: "Votre code de vérification temporaire à 6 chiffres pour votre compte Kobara est : " + otp
              });
              
              throw new Error("2FA_REQUIRED");
           }
        }

        return { 
          id: user.id, 
          email: user.email, 
          email_verified: user.email_verified,
          role: user.role 
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email_verified = user.email_verified
      }
      
      if (token.id) {
        try {
          token.supabaseAccessToken = signSupabaseToken(token.id, token.email as string)
        } catch (e) {
          console.error("Failed to sign Supabase JWT:", e)
        }
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          email_verified: token.email_verified
        }
        ;(session as any).supabaseAccessToken = token.supabaseAccessToken
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    callbackUrl: {
      name: isProduction ? "__Secure-authjs.callback-url" : "authjs.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    csrfToken: {
      name: isProduction ? "__Host-authjs.csrf-token" : "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { 
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
    updateAge: 15 * 60,
  },
})
