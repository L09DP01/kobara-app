import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase/admin"
import bcrypt from "bcryptjs"

const isProduction = process.env.NODE_ENV === "production"
const cookieDomain = isProduction ? ".kobara.app" : undefined

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Vérifier dans la table users (Supabase) via service_role
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("id, email, password_hash, role, is_active")
          .eq("email", email)
          .single()

        if (error || !user) {
          console.error("Auth error:", error?.message || "User not found")
          return null
        }

        if (user.is_active === false) {
          console.error("User inactive")
          return null
        }

        // Comparer le hash bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password_hash)

        if (!isValidPassword) {
          return null
        }

        return { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // Injecter le rôle dans le JWT lors du premier signIn
      if (user) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      // Exposer le rôle dans la session
      if (session.user) {
        session.user.role = token.role as string
        // Expose l'ID de l'utilisateur
        session.user.id = token.sub as string
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    callbackUrl: {
      name: isProduction ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain: cookieDomain,
      },
    },
    csrfToken: {
      name: isProduction ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
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
