import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
    try {
        const { username, email, password, firstName, lastName } = await req.json();

        // Vérifie que l'utilisateur n'existe pas déjà
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email ou username déjà utilisé"}, { status: 400});
        }

        // Hash le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

        // Crée l'utilisateur
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                firstName,
                lastName,
                role: "Student",
                isActive: true
            },
        });

        // Génère le JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Retourne le JWT et infos non sensibles
        return NextResponse.json({
            message: "Utilisateur crée avec succés",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}