import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const MOBILE_TOKEN_SECRET = process.env.NEXTAUTH_SECRET || process.env.SUPABASE_JWT_SECRET;

export interface MobileJwtPayload {
  sub: string;
  email: string;
  role: string;
  type: string;
  platform: string;
  [key: string]: any;
}

/**
 * Vérifie le token JWT envoyé par l'application mobile.
 * Retourne le payload si valide, sinon NextResponse (401).
 */
export async function verifyMobileToken(req: NextRequest): Promise<{ payload?: MobileJwtPayload, errorResponse?: NextResponse }> {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { 
        errorResponse: NextResponse.json({ error: "Non autorisé. Token manquant.", code: "UNAUTHORIZED" }, { status: 401 }) 
      };
    }

    const token = authHeader.split(" ")[1];

    if (!MOBILE_TOKEN_SECRET) {
      console.error("MOBILE_TOKEN_SECRET is not defined");
      return { 
        errorResponse: NextResponse.json({ error: "Erreur serveur.", code: "SERVER_ERROR" }, { status: 500 }) 
      };
    }

    const secret = new TextEncoder().encode(MOBILE_TOKEN_SECRET);
    
    // Verify the JWT
    const { payload } = await jwtVerify(token, secret);
    
    // Check if it's an access token
    if (payload.type !== "access") {
      return { 
        errorResponse: NextResponse.json({ error: "Type de token invalide.", code: "INVALID_TOKEN_TYPE" }, { status: 401 }) 
      };
    }

    return { payload: payload as unknown as MobileJwtPayload };

  } catch (error: any) {
    console.error("Mobile JWT verification failed:", error.message);
    
    if (error.code === 'ERR_JWT_EXPIRED') {
      return { 
        errorResponse: NextResponse.json({ error: "Token expiré.", code: "TOKEN_EXPIRED" }, { status: 401 }) 
      };
    }
    
    return { 
      errorResponse: NextResponse.json({ error: "Token invalide.", code: "UNAUTHORIZED" }, { status: 401 }) 
    };
  }
}
