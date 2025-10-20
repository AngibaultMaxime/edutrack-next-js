import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { email } from "zod";

export async function GET(req: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.emailAddresses[0].emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.publicMetadata.role || "student",
  });
}
