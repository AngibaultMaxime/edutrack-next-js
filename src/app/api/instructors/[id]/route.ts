import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import z from "zod";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const instructor = await prisma.instructor.findUnique({ where: { id } });

    if (!instructor)
      return NextResponse.json(
        { error: "Instructeur non trouvé" },
        { status: 404 }
      );

    return NextResponse.json(instructor);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de trouver l'instructeur." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();

  try {
    const instructor = await prisma.instructor.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(instructor); // status 200
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
      error.code === "P2025"
    )
      return NextResponse.json(
        { error: "Instructeur non trouvé" },
        { status: 404 }
      );
    return NextResponse.json(
      { error: "Impossible de mettre à jour l'instructeur." },
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
    await prisma.instructor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return NextResponse.json(
        { error: "Instructeur non trouvé" },
        { status: 404 }
      );
    return NextResponse.json(
      { error: "Impossible de supprimer l'instructeur." },
      { status: 500 }
    );
  }
}
