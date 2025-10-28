import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course)
    return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });

  return NextResponse.json(course);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const body = await req.json();

  const course = await prisma.course.update({ where: { id }, data: body });

  return NextResponse.json(course); // status 200
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await prisma.course.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
