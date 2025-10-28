import { prisma } from "@/lib/prisma";
import { createStudentSchema } from "@/lib/validation/student";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import z from "zod";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de récuperer les étudiants." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation Zod
    const studentData = createStudentSchema.parse(body);

    // Prisma create
    const student = await prisma.student.create({
      data: {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        registrationDate: studentData.registrationDate,
        level: studentData.level,
      },
    });
    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Erreur de format. Impossible de créer l'étudiant." },
        { status: 400 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return NextResponse.json(
        { error: "Un étudiant avec cet email existe déjà." },
        { status: 409 }
      );

    return NextResponse.json(
      { error: "Impossible de créer l'étudiant" },
      { status: 500 }
    );
  }
}
