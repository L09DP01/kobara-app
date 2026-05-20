import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createAdminClient } from "@/utils/supabase/admin";
import bcrypt from "bcryptjs";
import { signSupabaseToken } from "@/lib/server/auth/supabase-jwt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        language: { label: "Language", type: "text" }
      },
      async authorize(credentials) {
        const lang = credentials?.language || "fr";

        if (!credentials?.email || !credentials?.password) {
          throw new Error(
            lang === "en"
              ? "Please enter your email and password."
              : "Veuillez saisir votre e-mail et votre mot de passe."
          );
        }

        const supabase = createAdminClient();
        
        // Fetch user from public.users table
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email.toLowerCase().trim())
          .maybeSingle();

        if (error || !user) {
          throw new Error(
            lang === "en"
              ? "No account exists with this email."
              : "Aucun compte n'existe avec cet e-mail."
          );
        }

        // Verify if password is correct
        const passwordMatches = await bcrypt.compare(credentials.password, user.password_hash);
        if (!passwordMatches) {
          throw new Error(
            lang === "en"
              ? "Incorrect password."
              : "Mot de passe incorrect."
          );
        }

        // Check if account is verified
        if (!user.email_verified) {
          throw new Error(
            lang === "en"
              ? "Your account is not verified yet. Please check your inbox to validate your account."
              : "Votre compte n'est pas encore vérifié. Veuillez consulter votre boîte de réception pour valider votre compte."
          );
        }

        return {
          id: user.id,
          email: user.email,
          email_verified: user.email_verified
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
