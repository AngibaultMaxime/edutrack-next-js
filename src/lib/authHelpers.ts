import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// Fonction pour vérifier et récupérer le payload
export function verifyJWT(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("TOKEN_INVALID");
    }
    throw new Error("TOKEN_UNKNOWN_ERROR");
  }
}

// Helper réutilisable pour les routes
export async function getUserFromRequest(
  req: Request,
  allowedRoles: string[] = []
): Promise<{ user?: JWTPayload; error?: NextResponse }> {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
    }

    const payload = verifyJWT(token);

    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
      return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
    }

    return { user: payload };
  } catch (error: any) {
    if (error.message === "TOKEN_EXPIRED") {
      return { error: NextResponse.json({ error: "Token expiré" }, { status: 401 }) };
    }
    if (error.message === "TOKEN_INVALID") {
      return { error: NextResponse.json({ error: "Token invalide" }, { status: 401 }) };
    }
    return { error: NextResponse.json({ error: "Erreur d'authentification" }, { status: 401 }) };
  }
}