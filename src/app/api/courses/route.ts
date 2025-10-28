import { prisma } from "@/lib/prisma";
import { createCourseSchema, updateCourseSchema } from "@/lib/validation/course";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { success, z } from "zod";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de recuperer les cours." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation Zod
    const courseData = createCourseSchema.parse(body);

    // Prisma create
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        instructorId: courseData.instructorId,
        duration: courseData.duration,
        maxStudents: courseData.maxStudents,
        price: courseData.price,
        level: courseData.level,
      },
    });
    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Erreur de format. Impossible de créer le cours." },
        { status: 400 }
      );
    }

    // ✅ Erreur Prisma connue
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Clé étrangère invalide (instructorId n’existe pas)
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "L'instructeur spécifié n'existe pas." },
          { status: 400 }
        );
      }

      // Doublon unique, etc.
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Un cours avec ce titre existe déjà." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Impossible de créer le cours" },
      { status: 500 }
    );
  }
}
