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
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course)
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de trouver le cours." },
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
    const course = await prisma.course.update({ where: { id }, data: body });
    return NextResponse.json(course); // status 200
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        {
          error: "Erreur de format. Impossible de mettre à jour le cours.",
        },
        { status: 400 }
      );

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Un cours avec ce titre existe déjà." },
          { status: 409 }
        );
      }

      if (error.code === "P2025")
        return NextResponse.json(
          { error: "Cours non trouvé" },
          { status: 404 }
        );
    }

    return NextResponse.json(
      { error: "Impossible de mettre à jour le cours." },
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
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });
    return NextResponse.json(
      { error: "Impossible de supprimer le cours." },
      { status: 500 }
    );
  }
}
