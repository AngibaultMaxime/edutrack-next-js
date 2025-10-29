import { getUserFromRequest } from "@/lib/authHelpers";
import { prisma } from "@/lib/prisma";
import { createInstructorSchema } from "@/lib/validation/instructor";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(instructors);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de recuperer les instructeurs." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Vérifie le token et récupère l'utilisateur
  const { error } = await getUserFromRequest(req, ["Admin"]);

  if (error) return error; // 401 si pas de token, 403 si role interdit

  try {
    const body = await req.json();

    // Validation Zod
    const instructorData = createInstructorSchema.parse(body);

    // Prisma create
    const instructor = await prisma.instructor.create({
      data: {
        firstName: instructorData.firstName,
        lastName: instructorData.lastName,
        specialty: instructorData.specialty,
        email: instructorData.email,
        hireDate: instructorData.hireDate,
      },
    });
    return NextResponse.json({ success: true, instructor }, { status: 201 });
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

    return NextResponse.json(
      { error: "Impossible de créer l'instructeur" },
      { status: 500 }
    );
  }
}
