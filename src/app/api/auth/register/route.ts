import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createUserSchema } from "@/lib/validation/user";
import z from "zod";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { username, email, password, firstName, lastName, role } =
      createUserSchema.parse(await req.json());

    // Vérifie que l'utilisateur n'existe pas déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email ou username déjà utilisé" },
        { status: 400 }
      );
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
        role,
        isActive: true,
      },
    });

    // Génère le JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Retourne le JWT et infos non sensibles
    return NextResponse.json(
      {
        message: "Utilisateur crée avec succés",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          error: "Erreur de format. Impossible de créer le cours.",
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
