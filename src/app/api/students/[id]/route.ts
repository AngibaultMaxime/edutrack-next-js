import { getUserFromRequest } from "@/lib/authHelpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import z from "zod";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Vérifie le token et récupère l'utilisateur
  const { error } = await getUserFromRequest(req);

  if (error) return error; // 401 si pas de token, 403 si role interdit

  const { id } = params;

  try {
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student)
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de trouver l'étudiant." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Vérifie le token et récupère l'utilisateur
  const { error } = await getUserFromRequest(req, ["Admin"]);

  if (error) return error; // 401 si pas de token, 403 si role interdit

  const { id } = params;

  try {
    const body = await req.json();

    const student = await prisma.student.update({ where: { id }, data: body });
    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          error: "Erreur de format. Impossible de mettre à jour l'enrollment.",
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025")
        return NextResponse.json(
          { error: "Etudiant non trouvé" },
          { status: 404 }
        );

      if (error.code === "P2002")
        return NextResponse.json(
          { error: "Un étudiant avec cet email existe déjà." },
          { status: 409 }
        );
    }

    return NextResponse.json(
      { error: "Impossible de mettre à jour l'étudiant." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const etudiant = await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return NextResponse.json(
        { error: "Étudiant non trouvé" },
        { status: 404 }
      );
    return NextResponse.json(
      { error: "Impossible de supprimer l'étudiant." },
      { status: 500 }
    );
  }
}
