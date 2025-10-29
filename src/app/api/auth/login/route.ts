import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
    const { email, password } = await req.json();

    // Verifie que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json({ error: "Aucun utilisateur existant avec cet email."}, { status: 401});

    }

    // Verifie que le mot de passe est correct
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return NextResponse.json({ error: "Mot de passe incorrect."}, { status: 401 });
    }

    // Genere le JWT
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d"}  // durée validité du token
    );

    // Retourne le token au client
    return NextResponse.json({
        message: "Connexion réussie",
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
}