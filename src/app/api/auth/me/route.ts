import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authHelpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { user, error } = await getUserFromRequest(req);

  if (error) return error;
  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 401 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      username: true,
    },
  });

  if (!dbUser)
    return NextResponse.json(
      { error: "Utilisateur introuvable dans la DB" },
      { status: 404 }
    );

  return NextResponse.json(dbUser);
}
