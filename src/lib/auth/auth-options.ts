// import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createAdminClient } from "@/utils/supabase/admin";
import bcrypt from "bcryptjs";
import { signSupabaseToken } from "@/lib/server/auth/supabase-jwt";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

export const authOptions: any = {
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.kobara.app' : 'localhost'
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        language: { label: "Language", type: "text" },
        passkey_response: { label: "Passkey Response", type: "text" },
        otp: { label: "OTP Code", type: "text" }
      },
      async authorize(credentials) {
        const lang = credentials?.language || "fr";

        if (!credentials?.email) {
          throw new Error(lang === "en" ? "Please enter your email." : "Veuillez saisir votre e-mail.");
        }

        const supabase = createAdminClient();
        
        // Fetch user from public.users table
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email.toLowerCase().trim())
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

          if (!expectedChallenge) throw new Error("Challenge invalide ou expiré.");

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

          // Update counter and clear challenge
          passkey.counter = verification.authenticationInfo.newCounter;
          await supabase.from('settings').update({ 
            security_json: { ...security, passkeys, auth_challenge: null }
          }).eq('merchant_id', merchant.id);

          return { id: user.id, email: user.email, email_verified: user.email_verified, role: "merchant" };
        }

        // PASSWORD AUTHENTICATION
        if (!credentials.password) {
          throw new Error(lang === "en" ? "Password required." : "Mot de passe requis.");
        }

        const passwordMatches = await bcrypt.compare(credentials.password, user.password_hash);
        if (!passwordMatches) {
          throw new Error(lang === "en" ? "Incorrect password." : "Mot de passe incorrect.");
        }

        // 2FA VERIFICATION (Global logic)
        let requires2FA = false;

        const { data: ownedMerchants } = await supabase.from('merchants').select('id').eq('user_id', user.id);
        if (ownedMerchants && ownedMerchants.length > 0) {
          for (const m of ownedMerchants) {
            const { data: mSet } = await supabase.from('settings').select('security_json').eq('merchant_id', m.id).maybeSingle();
            if (mSet?.security_json?.['2fa_enabled']) requires2FA = true;
          }
        }

        const { data: memberships } = await supabase.from('merchant_members').select('merchant_id').eq('user_id', user.id).eq('status', 'active');
        if (memberships && memberships.length > 0) {
          for (const mem of memberships) {
            const { data: mSet } = await supabase.from('settings').select('security_json').eq('merchant_id', mem.merchant_id).maybeSingle();
            if (mSet?.security_json?.['2fa_enabled']) requires2FA = true;
          }
        }

        if (requires2FA) {
           if (credentials.otp) {
              const { Redis } = await import('@upstash/redis');
              const redis = Redis.fromEnv();
              const storedOtp = await redis.get(`otp:${user.email}`);
              if (!storedOtp || String(storedOtp) !== credentials.otp) {
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
          role: "merchant"
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email_verified = user.email_verified;
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
