import { prisma } from "@/lib/prisma";
import { createInstructorSchema } from "@/lib/validation/instructor";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(instructors);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch instructors" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
      return NextResponse.json(
        { error: "Impossible de créer l'instructeur" },
        { status: 500 }
      );
    }
  }
}
