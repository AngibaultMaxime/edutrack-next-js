import { getUserFromRequest } from "@/lib/authHelpers";
import { prisma } from "@/lib/prisma";
import { createEnrollmentSchema } from "@/lib/validation/enrollment";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import z from "zod";

export async function GET(req: Request) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de recuperer les enrollments." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Vérifie le token et récupère l'utilisateur
  const { error } = await getUserFromRequest(req);

  if (error) return error; // 401 si pas de token, 403 si role interdit

  try {
    const body = await req.json();

    const enrollmentData = createEnrollmentSchema.parse(body);

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: enrollmentData.courseId,
        studentId: enrollmentData.studentId,
        status: enrollmentData.status,
        grade: enrollmentData.grade,
      },
    });
    return NextResponse.json({ success: true, enrollment }, { status: 201 });
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    )
      return NextResponse.json(
        { error: "Le cours et/ou l'étudiant spécifié(s) n'existe(nt) pas." },
        { status: 400 }
      );

    return NextResponse.json(
      { error: "Impossible de créer l'enrollment." },
      { status: 500 }
    );
  }
}
